import request from '@/utils/request'

export function createArticle(data) {
  return request({
    url: '/article/create',
    method: 'post',
    data: data
  })
}
export function fetchList(query) {
  return request({
    url: '/article/list',
    method: 'get',
    params: query
  })
}
export function fetchArticle(id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}
