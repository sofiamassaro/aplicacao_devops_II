const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// Página principal: responde tanto em "/" quanto em "/index"
app.get(['/', '/index'], (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
})

// Rota de verificação: útil para confirmar que a API está no ar
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Só sobe o servidor quando o arquivo é executado diretamente
// (node src/app.js). Nos testes, o app é importado sem abrir a porta.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
  })
}

module.exports = app
