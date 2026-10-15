const request = require('supertest')
const app = require('../src/app')

describe('Rotas da aplicação', () => {
  test('GET / retorna a página HTML', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toMatch(/html/)
    expect(res.text).toContain('Olá')
  })

  test('GET /index retorna a mesma página', async () => {
    const res = await request(app).get('/index')
    expect(res.statusCode).toBe(200)
    expect(res.text).toContain('Olá')
  })

  test('GET /health retorna status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  test('rota inexistente retorna 404', async () => {
    const res = await request(app).get('/nao-existe')
    expect(res.statusCode).toBe(404)
  })
})
