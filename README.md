# cesusc-devops

API Node.js + Express da disciplina **Ferramentas de Implantação Contínua - DevOps**, com CI no GitHub Actions e deploy em uma instância EC2 da AWS atrás do Nginx.

```
src/app.js              servidor Express (rotas /, /index e /health, porta 3000)
src/views/index.html    página de saudação
tests/app.test.js       testes com Jest + Supertest
eslint.config.mjs       configuração do ESLint
.github/workflows/      ci.yaml (lint + testes) e deploy.yaml (deploy na EC2)
nginx/server-block.conf bloco server para o Nginx
```

Comandos locais: `npm start` (sobe em localhost:3000), `npm test`, `npm run lint`.

---

# Roteiro completo

## Parte 1 — GitHub (no seu computador)

**1. Criar o repositório no site do GitHub**
- New repository → nome `cesusc-devops` → **Public**
- **Não** marque README nem .gitignore (o projeto já tem os dois)
- Create repository

**2. Subir o projeto na `main`** (dentro da pasta descompactada):
```bash
git init
git add .
git commit -m "Projeto inicial: Express, testes, ESLint e workflows"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/cesusc-devops.git
git push -u origin main
```

**3. Criar a branch `develop`**
```bash
git checkout -b develop
git push -u origin develop
```

**4. Fluxo de feature (como a aula pede)** — exemplo:
```bash
git checkout develop
git pull
git checkout -b feature/nova-rota
# ... edita o código ...
git add .
git commit -m "Adiciona nova rota"
git push -u origin feature/nova-rota
```
No GitHub: **Compare & pull request** → base `develop` → Merge. O CI roda sozinho; veja na aba **Actions**.
Quando quiser publicar: Pull Request de `develop` → `main`.

## Parte 2 — AWS (console)

1. Canto superior direito: região **South America (São Paulo) sa-east-1**
2. EC2 → **Launch instance**
3. Name: `demo-node-app` · AMI: **Ubuntu**
4. Instance type: um com o selo **Free tier eligible**
5. Key pair → **Create new key pair** → RSA, `.pem` → guarde o arquivo baixado
6. Network settings: marque **SSH (Anywhere)**, **HTTPS** e **HTTP**
7. Storage: 8 GB
8. **Launch instance**
9. Em Instances, espere o estado **Running** e copie o **Public IPv4 address**

## Parte 3 — Conectar (PowerShell, na pasta onde está o .pem)

```bash
ssh -i "chave-pessoal.pem" ubuntu@SEU_IP_PUBLICO
```
Na primeira vez, responda `yes`.

Erro "UNPROTECTED PRIVATE KEY FILE" no Windows — rode no PowerShell:
```powershell
icacls .\chave-pessoal.pem /inheritance:r
icacls .\chave-pessoal.pem /grant:r "$($env:USERNAME):(R)"
```

## Parte 4 — Preparar o servidor (dentro da EC2)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
sudo npm install -g pm2
```
Se aparecer uma tela roxa perguntando sobre serviços para reiniciar, só aperte Enter.

## Parte 5 — Subir a aplicação

```bash
cd ~
git clone https://github.com/SEU_USUARIO/cesusc-devops.git
cd cesusc-devops
npm install --omit=dev
pm2 start src/app.js --name app
pm2 save
pm2 startup        # copie e rode o comando "sudo env PATH=..." que ele imprimir
curl localhost:3000/health     # deve responder {"status":"ok"}
```

## Parte 6 — Nginx

```bash
sudo vim /etc/nginx/nginx.conf
```
- `i` para editar
- Dentro de `http { ... }`, cole o conteúdo de `nginx/server-block.conf` trocando `SEU_IP_PUBLICO`
- `Esc`, depois `:wq` + Enter

```bash
sudo nginx -t
sudo systemctl restart nginx
```

Se continuar aparecendo "Welcome to nginx", desative o site padrão:
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

## Parte 7 — Testar

No navegador: `http://SEU_IP_PUBLICO` (http, não https).

## Parte 8 (opcional) — Deploy automático

No GitHub: Settings → Secrets and variables → Actions → New repository secret:
- `EC2_HOST` = IP público
- `EC2_SSH_KEY` = conteúdo inteiro do `.pem` (abra no bloco de notas e copie tudo, incluindo as linhas BEGIN/END)

A partir daí, todo push na `main` roda o `deploy.yaml`, que entra na EC2, faz `git pull` e reinicia o app.

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| Página não carrega (timeout) | HTTP não liberado no Security Group | EC2 → Security Groups → Inbound rules → adicionar HTTP 80 de 0.0.0.0/0 |
| 502 Bad Gateway | App não está rodando | `pm2 status`, `pm2 logs app` |
| Welcome to nginx | Site padrão ativo | apagar `sites-enabled/default` |
| SSH não conecta depois de religar | IP mudou | pegar o novo IP no console |

**Ao terminar a disciplina:** Instance state → **Terminate instance**, para não gerar cobrança.
