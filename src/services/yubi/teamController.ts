// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** addTeam POST /api/team/add */
export async function addTeamUsingPost(body: API.TeamAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/team/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** listTeamChartByPage POST /api/team/chart/page */
export async function listTeamChartByPageUsingPost(
  body: API.ChartQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageChart_>('/api/team/chart/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** regenChart POST /api/team/chart/regen */
export async function regenChartUsingPost(
  body: API.ChartRegenRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBIResponse_>('/api/team/chart/regen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteTeam POST /api/team/delete */
export async function deleteTeamUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/team/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** exitTeam POST /api/team/exit */
export async function exitTeamUsingPost(body: API.Team, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/team/exit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** getTeamById GET /api/team/get */
export async function getTeamByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTeamByIdUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseTeam_>('/api/team/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** joinTeam POST /api/team/join */
export async function joinTeamUsingPost(body: API.Team, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/team/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** listAllMyJoinedTeam GET /api/team/list/my/joined */
export async function listAllMyJoinedTeamUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListTeam_>('/api/team/list/my/joined', {
    method: 'GET',
    ...(options || {}),
  });
}

/** listTeam POST /api/team/list/page */
export async function listTeamUsingPost(
  body: API.TeamQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTeamVO_>('/api/team/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** pageTeam POST /api/team/page */
export async function pageTeamUsingPost(
  body: API.TeamQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTeam_>('/api/team/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** listMyJoinedTeam POST /api/team/page/my/joined */
export async function listMyJoinedTeamUsingPost(
  body: API.TeamQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTeamVO_>('/api/team/page/my/joined', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** updateTeam POST /api/team/update */
export async function updateTeamUsingPost(body: API.Team, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/team/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
