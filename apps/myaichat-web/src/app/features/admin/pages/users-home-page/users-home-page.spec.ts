import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore } from '@ngxs/store';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AppStore } from '@st/app/app.store';
import { createMockNzMessageService } from '@sh/testing';

import { UsersHomePage } from './users-home-page';
import { UsersApi } from '../../services';
import { RoleModel, UserModel } from '../../models';

type NzMessageServiceMock = ReturnType<typeof createMockNzMessageService>;

const defaultRoles: RoleModel[] = [
	{ id: 'role-1', name: 'Admin' },
	{ id: 'role-2', name: 'User' },
];

const defaultUsers: UserModel[] = [
	{
		id: 'user-1',
		name: 'Alice Johnson',
		ghLogin: 'alice',
		email: 'alice@example.com',
		avatar: 'https://example.com/avatar-1.png',
		role: defaultRoles[0],
		createdAt: new Date('2024-01-01T10:00:00Z'),
		updatedAt: new Date('2024-01-02T10:00:00Z'),
	},
];

const createUsersApiMock = (overrides?: Partial<UsersApi>) => ({
	fetchAll: vi.fn().mockResolvedValue(defaultUsers),
	fetchRoles: vi.fn().mockResolvedValue(defaultRoles),
	updateUserRole: vi.fn().mockResolvedValue(undefined),
	...overrides,
});

interface RenderOptions {
	users?: UserModel[];
	roles?: RoleModel[];
	usersApiOverrides?: Partial<UsersApi>;
	messageOverrides?: Partial<NzMessageServiceMock>;
}

describe('UsersHomePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderComponent = async (options: RenderOptions = {}) => {
		const usersApi = createUsersApiMock({
			fetchAll: vi.fn().mockResolvedValue(options.users ?? defaultUsers),
			fetchRoles: vi.fn().mockResolvedValue(options.roles ?? defaultRoles),
			...options.usersApiOverrides,
		});
		const messageService = createMockNzMessageService(options.messageOverrides);

		const renderResult = await render(UsersHomePage, {
			providers: [
				provideStore([AppStore]),
				{ provide: UsersApi, useValue: usersApi },
				{ provide: NzMessageService, useValue: messageService },
			],
		});

		return {
			...renderResult,
			usersApi,
			messageService,
		};
	};

	it('should render users data when loading completes', async () => {
		await renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
		});

		expect(screen.getByText('alice')).toBeInTheDocument();
		expect(screen.getByText('alice@example.com')).toBeInTheDocument();
	});

	it('should update the user role when selecting a new role', async () => {
		const user = userEvent.setup();
		const { usersApi, messageService } = await renderComponent();

		await waitFor(() => {
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
		});

		const roleSelect = screen.getByTestId('user-role-user-1');

		await user.click(roleSelect);
		await user.click(screen.getByText('User'));

		await waitFor(() => {
			expect(usersApi.updateUserRole).toHaveBeenCalledWith('user-1', { roleId: 'role-2' });
		});

		expect(messageService.success).toHaveBeenCalledWith('User role updated successfully');
	});

	it('should keep the role unchanged when update fails', async () => {
		const user = userEvent.setup();
		const { usersApi, messageService } = await renderComponent({
			usersApiOverrides: {
				updateUserRole: vi.fn().mockRejectedValue(new Error('Failed')),
			},
		});

		await waitFor(() => {
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
		});

		const roleSelect = screen.getByTestId('user-role-user-1');

		await user.click(roleSelect);
		await user.click(screen.getByText('User'));

		await waitFor(() => {
			expect(usersApi.updateUserRole).toHaveBeenCalledWith('user-1', { roleId: 'role-2' });
		});

		expect(messageService.success).not.toHaveBeenCalled();
	});

	it('should show initial fallback when user has no avatar', async () => {
		const users: UserModel[] = [
			{
				id: 'user-2',
				name: 'Zoe Harper',
				ghLogin: 'zoe',
				email: 'zoe@example.com',
				avatar: '',
				role: defaultRoles[1],
				createdAt: new Date('2024-02-01T10:00:00Z'),
				updatedAt: new Date('2024-02-02T10:00:00Z'),
			},
		];

		await renderComponent({ users });

		await waitFor(() => {
			expect(screen.getByText('Zoe Harper')).toBeInTheDocument();
		});

		expect(screen.getByText('Z', { selector: 'span' })).toBeInTheDocument();
	});

	it('should show N/A when user email is missing', async () => {
		const users: UserModel[] = [
			{
				id: 'user-3',
				name: 'No Email',
				ghLogin: 'no-email',
				email: '',
				avatar: 'https://example.com/avatar-3.png',
				role: defaultRoles[1],
				createdAt: new Date('2024-03-01T10:00:00Z'),
				updatedAt: new Date('2024-03-02T10:00:00Z'),
			},
		];

		await renderComponent({ users });

		await waitFor(() => {
			expect(screen.getByText('No Email')).toBeInTheDocument();
		});

		expect(screen.getByText('N/A')).toBeInTheDocument();
	});
});
