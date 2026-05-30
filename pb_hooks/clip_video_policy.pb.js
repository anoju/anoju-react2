onRecordCreateRequest(function (e) {
  var videoFiles = e.findUploadedFiles('video');

  if (!videoFiles || videoFiles.length === 0) {
    e.next();
    return;
  }

  var videoFile = videoFiles[0];
  var maxSize = 300 * 1024 * 1024;
  var minDuration = 5;
  var maxDuration = 30;
  var maxLongSide = 1280;
  var maxShortSide = 720;

  if (videoFile.size > maxSize) {
    throw new BadRequestError('동영상은 300MB 이하로 업로드해주세요.', {});
  }

  function createTempPath(prefix, extension) {
    return $os.tempDir() + '/' + prefix + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000000) + extension;
  }

  function createInputPath(file) {
    var originalName = file.originalName || file.name || '';
    var dotIndex = originalName.lastIndexOf('.');
    var extension = dotIndex >= 0 ? originalName.substring(dotIndex).replace(/[^a-zA-Z0-9.]/g, '').toLowerCase() : '';

    return createTempPath('anoju_clip_input', extension || '.video');
  }

  function cleanup(paths) {
    for (var i = 0; i < paths.length; i += 1) {
      if (!paths[i]) {
        continue;
      }

      try {
        $os.remove(paths[i]);
      } catch (error) {
        var message = getErrorMessage(error);

        if (message.indexOf('no such file or directory') >= 0) {
          continue;
        }

        $app.logger().warn('Clips 동영상 임시 파일 삭제 실패', 'path', paths[i], 'error', error);
      }
    }
  }

  function getErrorMessage(error) {
    if (!error) {
      return '';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (typeof error.value === 'string') {
      return error.value;
    }

    if (typeof error.message === 'string') {
      return error.message;
    }

    return String(error);
  }

  function writeFileToTemp(file, path) {
    var reader = file.reader.open();

    try {
      $os.writeFile(path, toBytes(reader, file.size + 1), 384);
    } finally {
      if (reader && typeof reader.close === 'function') {
        reader.close();
      }
    }
  }

  function readMetadata(path) {
    var output;

    try {
      output = $os
        .exec(
          'ffprobe',
          '-v',
          'error',
          '-select_streams',
          'v:0',
          '-show_entries',
          'stream=width,height:format=duration',
          '-of',
          'json',
          path,
        )
        .output();
    } catch (error) {
      $app.logger().warn('Clips 동영상 ffprobe 실행 실패', 'error', error);
      throw new BadRequestError('동영상 정보를 확인할 수 없습니다.', {});
    }

    try {
      return JSON.parse(commandOutputToText(output));
    } catch (error) {
      $app.logger().warn('Clips 동영상 ffprobe 결과 파싱 실패', 'output', commandOutputToText(output), 'error', error);
      throw new BadRequestError('동영상 정보를 확인할 수 없습니다.', {});
    }
  }

  function commandOutputToText(output) {
    var byteTextPattern = /^\d+(,\d+)*$/;

    if (typeof output === 'string') {
      return byteTextPattern.test(output.trim())
        ? String.fromCharCode.apply(null, output.split(',').map(function (value) {
          return Number(value);
        }))
        : output;
    }

    if (!output) {
      return '';
    }

    var values = [];

    try {
      values = Array.from(output);
    } catch (_) {
      values = [];
    }

    if (values.length === 0 && typeof output.length === 'number') {
      for (var i = 0; i < output.length; i += 1) {
        values.push(output[i]);
      }
    }

    if (values.length === 0) {
      var outputText = String(output);

      if (byteTextPattern.test(outputText.trim())) {
        return String.fromCharCode.apply(null, outputText.split(',').map(function (value) {
          return Number(value);
        }));
      }

      return outputText;
    }

    if (typeof values[0] === 'number') {
      return String.fromCharCode.apply(null, values);
    }

    return String(output);
  }

  function getTrimRange(sourceDuration) {
    var body = e.requestInfo().body || {};
    var start = Number(body.videoTrimStart);
    var end = Number(body.videoTrimEnd);

    if (!Number.isFinite(start)) {
      start = 0;
    }

    if (!Number.isFinite(end)) {
      end = Math.min(sourceDuration, maxDuration);
    }

    start = Math.max(0, Math.min(start, Math.max(sourceDuration - minDuration, 0)));
    end = Math.max(start + minDuration, Math.min(end, sourceDuration));

    if (end - start > maxDuration) {
      end = Math.min(sourceDuration, start + maxDuration);
    }

    return {
      start: start,
      duration: Math.max(minDuration, Math.min(end - start, maxDuration)),
    };
  }

  function convert(inputPath, outputPath, trimRange) {
    try {
      $os
        .exec(
          'ffmpeg',
          '-y',
          '-ss',
          String(trimRange.start),
          '-i',
          inputPath,
          '-t',
          String(trimRange.duration),
          '-map',
          '0:v:0',
          '-map',
          '0:a?',
          '-vf',
          "scale=w='if(gte(iw,ih),1280,720)':h='if(gte(iw,ih),720,1280)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
          '-c:v',
          'libx264',
          '-preset',
          'veryfast',
          '-crf',
          '23',
          '-pix_fmt',
          'yuv420p',
          '-c:a',
          'aac',
          '-b:a',
          '128k',
          '-movflags',
          '+faststart',
          outputPath,
        )
        .output();
    } catch (error) {
      $app.logger().warn('Clips 동영상 변환 실패', 'error', error);
      throw new BadRequestError('동영상을 변환하지 못했습니다.', {});
    }
  }

  function validateOutput(path) {
    var metadata = readMetadata(path);
    var stream = metadata && metadata.streams && metadata.streams.length > 0 ? metadata.streams[0] : null;
    var duration = Number(metadata && metadata.format ? metadata.format.duration : 0);
    var width = Number(stream ? stream.width : 0);
    var height = Number(stream ? stream.height : 0);

    if (!stream || !width || !height || !duration) {
      throw new BadRequestError('동영상 정보를 확인할 수 없습니다.', {});
    }

    if (duration > maxDuration + 0.25) {
      throw new BadRequestError('동영상은 30초 이하로 업로드해주세요.', {});
    }

    if (Math.max(width, height) > maxLongSide || Math.min(width, height) > maxShortSide) {
      throw new BadRequestError('동영상 해상도는 최대 720p까지 업로드할 수 있습니다.', {});
    }
  }

  var inputPath = createInputPath(videoFile);
  var outputPath = createTempPath('anoju_clip_output', '.mp4');
  var outputAttached = false;

  try {
    writeFileToTemp(videoFile, inputPath);

    var inputMetadata = readMetadata(inputPath);
    var sourceDuration = Number(inputMetadata && inputMetadata.format ? inputMetadata.format.duration : 0);

    convert(inputPath, outputPath, getTrimRange(sourceDuration));
    validateOutput(outputPath);
    e.record.set('video', $filesystem.fileFromPath(outputPath));
    outputAttached = true;
    e.next();
  } catch (error) {
    if (!outputAttached) {
      cleanup([outputPath]);
    }

    throw error;
  } finally {
    cleanup([inputPath]);
  }
}, 'clips');
