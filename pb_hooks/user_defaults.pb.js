onRecordCreateRequest(function (e) {
  function isBlank(value) {
    return typeof value !== 'string' || value.trim() === '';
  }

  function applyUserDefaults(record) {
    if (isBlank(record.get('role'))) {
      record.set('role', 'user');
    }

    if (isBlank(record.get('status'))) {
      record.set('status', 'active');
    }
  }

  if (e.hasSuperuserAuth()) {
    applyUserDefaults(e.record);
  } else {
    e.record.set('role', 'user');
    e.record.set('status', 'active');
  }

  e.next();
}, 'users');

onRecordUpdateRequest(function (e) {
  function isBlank(value) {
    return typeof value !== 'string' || value.trim() === '';
  }

  function applyUserDefaults(record) {
    if (isBlank(record.get('role'))) {
      record.set('role', 'user');
    }

    if (isBlank(record.get('status'))) {
      record.set('status', 'active');
    }
  }

  function lockUserPermissionFields() {
    if (e.hasSuperuserAuth()) {
      applyUserDefaults(e.record);
      return;
    }

    var original = e.record.original();
    var originalRole = original.get('role');
    var originalStatus = original.get('status');
    var authId = e.auth && e.auth.id ? e.auth.id : '';
    var requestedStatus = e.record.get('status');
    var isSelfWithdraw = authId !== '' && authId === e.record.id && requestedStatus === 'withdrawn';

    e.record.set('role', isBlank(originalRole) ? 'user' : originalRole);
    e.record.set('status', isSelfWithdraw ? 'withdrawn' : (isBlank(originalStatus) ? 'active' : originalStatus));
  }

  lockUserPermissionFields();
  e.next();
}, 'users');
