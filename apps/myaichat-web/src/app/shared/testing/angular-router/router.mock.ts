import { vi } from 'vitest';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { convertToParamMap, ParamMap, Params } from '@angular/router';

/**
 * Creates a mock Router
 *
 * @param overrides Optional overrides for specific Router methods
 * @returns Mock Router instance
 *
 * @example
 * ```typescript
 * const mockRouter = createMockRouter({
 *   navigate: vi.fn().mockResolvedValue(true),
 *   url: '/home'
 * });
 *
 * TestBed.configureTestingModule({
 *   providers: [
 *     { provide: Router, useValue: mockRouter }
 *   ]
 * });
 * ```
 */
export function createMockRouter(overrides?: Partial<any>) {
  return {
    navigate: vi.fn().mockResolvedValue(true),
    navigateByUrl: vi.fn().mockResolvedValue(true),
    url: '/',
    events: of(),
    createUrlTree: vi.fn(),
    serializeUrl: vi.fn().mockReturnValue(''),
    parseUrl: vi.fn(),
    isActive: vi.fn().mockReturnValue(false),
    routerState: {
      root: {},
      snapshot: {},
    },
    config: [],
    ...overrides,
  };
}

/**
 * Creates a mock ActivatedRoute
 *
 * @param params Optional params configuration
 * @returns Mock ActivatedRoute instance
 *
 * @example
 * ```typescript
 * const mockActivatedRoute = createMockActivatedRoute({
 *   params: { id: '123' },
 *   queryParams: { search: 'test' },
 *   data: { title: 'Test Page' }
 * });
 *
 * TestBed.configureTestingModule({
 *   providers: [
 *     { provide: ActivatedRoute, useValue: mockActivatedRoute }
 *   ]
 * });
 * ```
 */
export function createMockActivatedRoute(params: {
  params?: Params;
  queryParams?: Params;
  data?: any;
  fragment?: string | null;
  url?: any[];
  outlet?: string;
  paramMap?: ParamMap;
  queryParamMap?: ParamMap;
} = {}) {
  const {
    params: routeParams = {},
    queryParams = {},
    data = {},
    fragment = null,
    url = [],
    outlet = 'primary',
    paramMap,
    queryParamMap,
  } = params;

  const paramsSubject = new BehaviorSubject(routeParams);
  const queryParamsSubject = new BehaviorSubject(queryParams);
  const dataSubject = new BehaviorSubject(data);
  const fragmentSubject = new BehaviorSubject(fragment);
  const urlSubject = new BehaviorSubject(url);

  const paramMapSubject = new BehaviorSubject(
    paramMap || convertToParamMap(routeParams)
  );
  const queryParamMapSubject = new BehaviorSubject(
    queryParamMap || convertToParamMap(queryParams)
  );

  return {
    params: paramsSubject.asObservable(),
    queryParams: queryParamsSubject.asObservable(),
    data: dataSubject.asObservable(),
    fragment: fragmentSubject.asObservable(),
    url: urlSubject.asObservable(),
    paramMap: paramMapSubject.asObservable(),
    queryParamMap: queryParamMapSubject.asObservable(),
    snapshot: {
      params: routeParams,
      queryParams,
      data,
      fragment,
      url,
      outlet,
      paramMap: paramMap || convertToParamMap(routeParams),
      queryParamMap: queryParamMap || convertToParamMap(queryParams),
      root: {},
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      routeConfig: null,
      title: undefined,
    },
    outlet,
    component: null,
    routeConfig: null,
    root: {} as any,
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
    title: of(undefined),
    // Helper methods to update values in tests
    _updateParams: (newParams: Params) => {
      paramsSubject.next(newParams);
      paramMapSubject.next(convertToParamMap(newParams));
    },
    _updateQueryParams: (newQueryParams: Params) => {
      queryParamsSubject.next(newQueryParams);
      queryParamMapSubject.next(convertToParamMap(newQueryParams));
    },
    _updateData: (newData: any) => {
      dataSubject.next(newData);
    },
    _updateFragment: (newFragment: string | null) => {
      fragmentSubject.next(newFragment);
    },
    _updateUrl: (newUrl: any[]) => {
      urlSubject.next(newUrl);
    },
  };
}

/**
 * Creates a mock ActivatedRouteSnapshot
 *
 * @param params Optional params configuration
 * @returns Mock ActivatedRouteSnapshot instance
 *
 * @example
 * ```typescript
 * const mockSnapshot = createMockActivatedRouteSnapshot({
 *   params: { id: '123' },
 *   data: { requiresAuth: true }
 * });
 * ```
 */
export function createMockActivatedRouteSnapshot(params: {
  params?: Params;
  queryParams?: Params;
  data?: any;
  fragment?: string | null;
  url?: any[];
  outlet?: string;
} = {}) {
  const {
    params: routeParams = {},
    queryParams = {},
    data = {},
    fragment = null,
    url = [],
    outlet = 'primary',
  } = params;

  return {
    params: routeParams,
    queryParams,
    data,
    fragment,
    url,
    outlet,
    paramMap: convertToParamMap(routeParams),
    queryParamMap: convertToParamMap(queryParams),
    root: {} as any,
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [],
    routeConfig: null,
    title: undefined,
  };
}

/**
 * Creates a mock RouterStateSnapshot
 *
 * @param url The URL for the snapshot
 * @param root Optional root ActivatedRouteSnapshot
 * @returns Mock RouterStateSnapshot instance
 *
 * @example
 * ```typescript
 * const mockRouterState = createMockRouterStateSnapshot('/home');
 * ```
 */
export function createMockRouterStateSnapshot(
  url: string = '/',
  root?: any
) {
  return {
    url,
    root: root || createMockActivatedRouteSnapshot(),
  };
}
