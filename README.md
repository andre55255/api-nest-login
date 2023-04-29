## Projeto de API em NestJS para entendimento de conceitos
##### API feita com opção de login com JWT e authorize utilizando padrão do framework

###### Para testar deve-se adicionar um arquivo .env com as variáveis a seguir:
#
> PORT=8081 Porta onde vai rodar a api
> DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome do banco?schema=public"
> JWT_SECRET=chave secreta de geração e validação de token
> JWT_AUDIENCE=identificador de veracidade do token (String)
> JWT_ISSUER=identificador de veracidade do token (String)
> CLIENT_URL=http://localhost:3000 Indica url do frontend para tela de recuperação de senha (TODO)
#