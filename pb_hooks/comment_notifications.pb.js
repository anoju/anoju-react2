onRecordAfterCreateSuccess(function (e) {
  function isBlank(value) {
    return typeof value !== 'string' || value.trim() === '';
  }

  function getPostPath(postRecord) {
    var postId = postRecord.id;
    var postType = postRecord.get('type');

    if (postType === 'gallery') {
      return '/snaps/pics/' + postId;
    }

    if (postType === 'it_logs') {
      return '/lounge/dev-log/' + postId;
    }

    return '/lounge/free-board/' + postId;
  }

  function getPostTypeLabel(postRecord) {
    var postType = postRecord.get('type');

    if (postType === 'gallery') return 'Pics';
    if (postType === 'it_logs') return 'DevLog';
    return '자유게시판';
  }

  function createNotificationOnce(collection, params) {
    if (isBlank(params.recipient) || params.recipient === params.actor) {
      return;
    }

    var existingCount = $app.countRecords(
      'notifications',
      $dbx.hashExp({
        recipient: params.recipient,
        actor: params.actor,
        type: params.type,
        targetId: params.targetId
      })
    );

    if (existingCount > 0) {
      return;
    }

    var notification = new Record(collection);

    notification.set('recipient', params.recipient);
    notification.set('actor', params.actor);
    notification.set('type', params.type);
    notification.set('title', params.title);
    notification.set('message', params.message);
    notification.set('targetUrl', params.targetUrl);
    notification.set('targetType', 'comment');
    notification.set('targetId', params.targetId);
    notification.set('isRead', false);
    notification.set('hidden', false);

    $app.saveNoValidate(notification);
  }

  function collectMentionNames(content) {
    var mentionPattern = /@([A-Za-z0-9_가-힣]{2,24})/g;
    var names = [];
    var seen = {};
    var match;

    while ((match = mentionPattern.exec(content)) !== null) {
      var name = match[1];

      if (!isBlank(name) && !seen[name]) {
        seen[name] = true;
        names.push(name);
      }
    }

    return names;
  }

  function findUserByNickname(nickname) {
    var users = $app.findRecordsByFilter(
      'users',
      'nickname = {:nickname} && status = "active"',
      '',
      1,
      0,
      { nickname: nickname }
    );

    return users && users.length > 0 ? users[0] : null;
  }

  function createMentionNotifications(collection, commentRecord, postRecord, actor, targetUrl, targetLabel) {
    var content = commentRecord.get('content') || '';
    var mentionNames = collectMentionNames(content);

    for (var i = 0; i < mentionNames.length; i += 1) {
      var user = findUserByNickname(mentionNames[i]);

      if (!user) {
        continue;
      }

      createNotificationOnce(collection, {
        recipient: user.id,
        actor: actor,
        type: 'mention',
        title: '회원님을 태그했습니다.',
        message: targetLabel + ' "' + postRecord.get('title') + '"의 댓글에서 회원님을 태그했습니다.',
        targetUrl: targetUrl,
        targetId: commentRecord.id
      });
    }
  }

  e.next();

  try {
    var postId = e.record.get('post');
    var actor = e.record.get('author');

    if (isBlank(postId) || isBlank(actor)) {
      return;
    }

    var post = $app.findRecordById('posts', postId);
    var notificationsCollection = $app.findCollectionByNameOrId('notifications');
    var targetUrl = getPostPath(post) + '#comment-' + e.record.id;
    var targetLabel = getPostTypeLabel(post);

    createNotificationOnce(notificationsCollection, {
      recipient: post.get('author'),
      actor: actor,
      type: 'post_comment',
      title: '내 글에 새 댓글이 달렸습니다.',
      message: targetLabel + ' "' + post.get('title') + '"에 댓글이 달렸습니다.',
      targetUrl: targetUrl,
      targetId: e.record.id
    });

    var parentCommentId = e.record.get('parentComment');

    if (!isBlank(parentCommentId)) {
      var parentComment = $app.findRecordById('comments', parentCommentId);

      createNotificationOnce(notificationsCollection, {
        recipient: parentComment.get('author'),
        actor: actor,
        type: 'comment_reply',
        title: '내 댓글에 답글이 달렸습니다.',
        message: targetLabel + ' "' + post.get('title') + '"의 댓글에 답글이 달렸습니다.',
        targetUrl: targetUrl,
        targetId: e.record.id
      });
    }

    createMentionNotifications(notificationsCollection, e.record, post, actor, targetUrl, targetLabel);
  } catch (error) {
    $app.logger().error('댓글 알림 생성 실패', 'commentId', e.record.id, 'error', error);
  }
}, 'comments');
