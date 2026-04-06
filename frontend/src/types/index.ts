export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}

export interface Document {
  id: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  isArchived: boolean;
  isPublished: boolean;
  parentDocumentId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetail extends Document {
  content: string | null;
  tags: { tag: Tag }[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
}
