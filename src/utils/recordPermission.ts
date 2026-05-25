interface EditableUser {
  id: string;
  role?: string;
}

interface AuthoredRecord {
  author?: string;
}

export const canEditAuthoredRecord = (record: AuthoredRecord | null | undefined, user: EditableUser | null | undefined) => {
  if (!record || !user) {
    return false;
  }

  return record.author === user.id || user.role === 'admin';
};
