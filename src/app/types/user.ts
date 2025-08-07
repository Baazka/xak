export type User = {
  id: number;
  name: string;
  email: string;
};
export type UserWithPagination = {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
export type UserResponse = {
  data: User[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
export type UserErrorResponse = {
  error: string;
};
export type UserRequest = {
  page?: number;
  pageSize?: number;
  search?: string;
};
export type UserQueryParams = {
  page?: string;
  pageSize?: string;
  search?: string;
};
export type UserQuery = {
  page: number;
  pageSize: number;
  search?: string;
};

export type UserUpdate = {
  id: number;
  name?: string;
  email?: string;
};
export type UserCreate = {
  name: string;
  email: string;
};
export type UserDelete = {
  id: number;
};
export type UserListResponse = {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
};
export type UserListRequest = {
  page?: number;
  pageSize?: number;
  search?: string;
};
export type UserListQuery = {
  page: number;
  pageSize: number;
  search?: string;
};
export type UserListQueryParams = {
  page?: string;
  pageSize?: string;
  search?: string;
};
export type UserListErrorResponse = {
  error: string;
};
export type UserListSuccessResponse = {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
};
export type UserListWithPagination = {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
export type UserListResponseWithPagination = {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
export type UserListError = {
  error: string;
};
export type UserListQueryParamsWithSearch = {
  page?: string;
  pageSize?: string;
  search?: string;
};
export type UserListQueryWithSearch = {
  page: number;
  pageSize: number;
  search?: string;
};
export type UserListRequestWithSearch = {
  page?: number;
  pageSize?: number;
  search?: string;
};
export type UserListResponseWithSearch = {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  search?: string;
};
export type UserListErrorWithSearch = {
  error: string;
};
export type UserListWithSearch = {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  search?: string;
};
