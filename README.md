## Projeto de API em NestJS para entendimento de conceitos
##### API feita com opção de login com JWT e authorize utilizando padrão do framework

###### Para testar deve-se adicionar um arquivo .env com as variáveis a seguir:
#
> PORT=8081 Porta onde vai rodar a api <br>
> ENVIRONMENT=dev Tipo de ambiente de execução <br>
> DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome do banco?schema=public" <br>
#
> JWT_SECRET=chave secreta de geração e validação de token <br>
> JWT_AUDIENCE=identificador de veracidade do token (String) <br>
> JWT_ISSUER=identificador de veracidade do token (String) <br>
> JWT_EXPIRES_IN_ACCESS_TOKEN=colocar o tempo de validade do token jwt <br>
#
> EMAIL_HOST=endereço de smtp
> EMAIL_PORT=porta de smtp
> EMAIL_SSL=true definição se vai usar ssl ou não
> EMAIL_USER=usuário de smtp
> EMAIL_PASS=senha de smtp
#
> CLIENT_URL=http://localhost:3000 Indica url do frontend para tela de recuperação de senha (TODO)
#
