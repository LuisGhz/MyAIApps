import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '@env/environment';
import {
  GetAllRolesResModel,
  GetAllUsersResModel,
  RoleModel,
  UpdateUserRoleReqModel,
  UpdateUserRoleResModel,
  UserModel,
} from '../models';
import { UsersApi } from './users-api';

describe('UsersApi', () => {
  let service: UsersApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [UsersApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsersApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should fetch all users from the user endpoint', async () => {
    const users: UserModel[] = [
      {
        id: 'user-1',
        ghLogin: 'alice',
        name: 'Alice Johnson',
        avatar: 'https://example.com/alice.png',
        email: 'alice@example.com',
        role: { id: 'role-1', name: 'Admin' },
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    ];
    const response: GetAllUsersResModel = { users };

    const usersPromise = service.fetchAll();
    const request = httpTestingController.expectOne(`${environment.apiUrl}/user`);

    expect(request.request.method).toBe('GET');

    request.flush(response);

    await expect(usersPromise).resolves.toEqual(users);
  });

  it('should fetch available roles from the roles endpoint', async () => {
    const roles: RoleModel[] = [
      { id: 'role-1', name: 'Admin' },
      { id: 'role-2', name: 'User' },
    ];
    const response: GetAllRolesResModel = { roles };

    const rolesPromise = service.fetchRoles();
    const request = httpTestingController.expectOne(`${environment.apiUrl}/user/roles`);

    expect(request.request.method).toBe('GET');

    request.flush(response);

    await expect(rolesPromise).resolves.toEqual(roles);
  });

  it('should patch the selected user role', async () => {
    const userId = 'user-1';
    const req: UpdateUserRoleReqModel = { roleId: 'role-2' };
    const response: UpdateUserRoleResModel = { message: 'Role updated' };

    const updatePromise = service.updateUserRole(userId, req);
    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/user/${userId}/update-role`,
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(req);

    request.flush(response);

    await expect(updatePromise).resolves.toEqual(response);
  });
});
