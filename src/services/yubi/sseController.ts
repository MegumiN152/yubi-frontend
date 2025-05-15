// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** teamSSEConnect GET /api/sse/team/connect */
export async function teamSseConnectUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.teamSSEConnectUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.SseEmitter>('/api/sse/team/connect', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** userSSEConnect GET /api/sse/user/connect */
export async function userSseConnectUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.userSSEConnectUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.SseEmitter>('/api/sse/user/connect', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
