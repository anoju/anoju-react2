onRecordAfterCreateSuccess(function (e) {
  function getReactionTargetCollection(targetType) {
    if (targetType === 'post') return 'posts';
    if (targetType === 'comment') return 'comments';
    if (targetType === 'clip') return 'clips';
    if (targetType === 'clip_comment') return 'clip_comments';
    return '';
  }

  function syncReactionCounts(reactionRecord) {
    var targetType = reactionRecord.get('targetType');
    var targetId = reactionRecord.get('targetId');
    var collectionName = getReactionTargetCollection(targetType);

    if (!collectionName || !targetId) {
      return;
    }

    var targetRecord = $app.findRecordById(collectionName, targetId);
    var likeCount = $app.countRecords(
      'reactions',
      $dbx.hashExp({
        targetType: targetType,
        targetId: targetId,
        type: 'like'
      })
    );
    var dislikeCount = $app.countRecords(
      'reactions',
      $dbx.hashExp({
        targetType: targetType,
        targetId: targetId,
        type: 'dislike'
      })
    );

    targetRecord.set('likeCount', likeCount);
    targetRecord.set('dislikeCount', dislikeCount);
    $app.saveNoValidate(targetRecord);
  }

  e.next();
  syncReactionCounts(e.record);
}, 'reactions');

onRecordAfterDeleteSuccess(function (e) {
  function getReactionTargetCollection(targetType) {
    if (targetType === 'post') return 'posts';
    if (targetType === 'comment') return 'comments';
    if (targetType === 'clip') return 'clips';
    if (targetType === 'clip_comment') return 'clip_comments';
    return '';
  }

  function syncReactionCounts(reactionRecord) {
    var targetType = reactionRecord.get('targetType');
    var targetId = reactionRecord.get('targetId');
    var collectionName = getReactionTargetCollection(targetType);

    if (!collectionName || !targetId) {
      return;
    }

    var targetRecord = $app.findRecordById(collectionName, targetId);
    var likeCount = $app.countRecords(
      'reactions',
      $dbx.hashExp({
        targetType: targetType,
        targetId: targetId,
        type: 'like'
      })
    );
    var dislikeCount = $app.countRecords(
      'reactions',
      $dbx.hashExp({
        targetType: targetType,
        targetId: targetId,
        type: 'dislike'
      })
    );

    targetRecord.set('likeCount', likeCount);
    targetRecord.set('dislikeCount', dislikeCount);
    $app.saveNoValidate(targetRecord);
  }

  e.next();
  syncReactionCounts(e.record);
}, 'reactions');
