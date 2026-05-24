var DEFAULT_USER_ROLE = 'user';
var DEFAULT_USER_STATUS = 'active';

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function applyUserDefaults(record) {
  if (isBlank(record.get('role'))) {
    record.set('role', DEFAULT_USER_ROLE);
  }

  if (isBlank(record.get('status'))) {
    record.set('status', DEFAULT_USER_STATUS);
  }
}

function lockUserPermissionFields(e) {
  if (e.hasSuperuserAuth()) {
    applyUserDefaults(e.record);
    return;
  }

  var original = e.record.original();
  var originalRole = original.get('role');
  var originalStatus = original.get('status');

  e.record.set('role', isBlank(originalRole) ? DEFAULT_USER_ROLE : originalRole);
  e.record.set('status', isBlank(originalStatus) ? DEFAULT_USER_STATUS : originalStatus);
}

onRecordCreateRequest(function (e) {
  if (e.hasSuperuserAuth()) {
    applyUserDefaults(e.record);
  } else {
    e.record.set('role', DEFAULT_USER_ROLE);
    e.record.set('status', DEFAULT_USER_STATUS);
  }

  e.next();
}, 'users');

onRecordUpdateRequest(function (e) {
  lockUserPermissionFields(e);
  e.next();
}, 'users');
