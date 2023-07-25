# Documentação da API

## Obter Reservas por Usuário

Retorna uma lista de reservas associadas a um usuário específico.

- **URL da Rota:** `/api/reservations/find-by-user`

- **Método:** `GET`

### Parâmetros da Solicitação

Nenhum parâmetro adicional é necessário para esta solicitação.

### Resposta

A resposta será uma matriz JSON contendo objetos de reserva no seguinte formato:

```json
[
  {
    "id": "f1058775-ef59-4765-9f0e-233ec89252ba",
    "date": "2023-07-25T00:50:23.960Z",
    "court": "Quadra 1",
    "court_id": "b5bd0508-0f74-4577-88a5-729a43a395af",
    "arena": "Arena 1",
    "arena_id": "6743a774-ff4e-4f05-886f-fe5650357bb3",
    "status": "PENDING"
  }
]
```

## Atualizar Usuário

Atualiza os parâmetros de um usuário existente.

- **URL da Rota:** `/api/users`

- **Método:** `PATCH`

- **Autenticação:** Bearer Token

### Parâmetros da Solicitação

A solicitação deve conter um cabeçalho de autorização com um Bearer Token válido para autenticar o usuário.

O corpo da solicitação deve ser um objeto JSON contendo os parâmetros que desejam ser atualizados:

```json
{
  "username": "novo_username",
  "name": "Novo Nome",
  "avatar": "URL_da_nova_imagem_de_avatar",
  "favorite_sport": "Esporte Favorito",
  "favorite_time": "Horário Favorito",
  "cellphone": "999999999",
  "nickname": "Apelido",
  "role": "Papel_do_usuário"
}
```

### Parâmetros de Atualização Disponíveis

- `username` (opcional): Nome de usuário do usuário. Deve estar entre 3 e 106 caracteres e ser um slug válido.

- `name` (opcional): Nome do usuário. Deve estar entre 3 e 100 caracteres e não deve conter caracteres especiais.

- `avatar` (opcional): URL da imagem do avatar do usuário.

- `favorite_sport` (opcional): Esporte favorito do usuário. Deve ser um valor entre os valores permitidos.

- `favorite_time` (opcional): Horário favorito do usuário. Deve ser um valor entre os valores permitidos.

- `cellphone` (opcional): Número de celular do usuário. Deve estar entre 9 e 12 caracteres.

- `nickname` (opcional): Apelido do usuário. Deve estar entre 3 e 100 caracteres.

- `role` (opcional): Papel do usuário. Deve ser um valor entre os valores permitidos.

### Códigos de Resposta

- **200 OK:** A solicitação foi bem-sucedida, e os parâmetros do usuário foram atualizados com sucesso.

- **401 Unauthorized:** O token de autorização fornecido é inválido ou expirou.

- **500 Internal Server Error:** Ocorreu um erro no servidor ao processar a solicitação.

## Atualizar Senha Usuário

Atualiza a senha de um usuário autenticado.

- **URL da Rota:** `/api/auth/update-password`

- **Método:** `PATCH`

- **Autenticação:** Bearer Token

### Parâmetros da Solicitação

A solicitação deve conter um cabeçalho de autorização com um Bearer Token válido para autenticar o usuário.

O corpo da solicitação deve ser um objeto JSON contendo os seguintes parâmetros:

```json
{
    "last_password": "senha_antiga",
    "password": "senha_nova",
    "password_confirmation": "senha_nova"
}
```

### Resposta

A resposta será um objeto JSON contendo os detalhes do usuário após a atualização, juntamente com um novo access token.

```json
{
    "user": {
        "id": "528a09a7-1f6b-411e-95ae-fa7dab367161",
        "name": "Luiz Da Silva",
        "username": "luiz.nascimento",
        "email": "luizh.nnh@gmail.com",
        "avatar": null,
        "cpf": null,
        "cellphone": "11948371593",
        "nickname": "Luizinho",
        "created_at": "2023-07-23T14:05:42.118Z",
        "updated_at": "2023-07-25T01:35:14.842Z"
    },
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyOGEwOWE3LTFmNmItNDExZS05NWFlLWZhN2RhYjM2NzE2MSIsImlhdCI6MTY5MDI0ODkxOCwiZXhwIjoxNjkwMjQ5NTE4LCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJpc3MiOiI1MDcxOWNhMC00ZDQwLTQ0ZTUtYTM2MC1mZjNjMmI5NGYwYTgiLCJzdWIiOiJsdWl6aC5ubmhAZ21haWwuY29tIn0.Q0HVnt3AwfsJnmu4vCmOKrh6TDghR9t7KuTwdoxLHIc06AUdlDxt17h-hST
```

## Buscar Quadras Disponíveis

Esta rota retorna as arenas próximas que possuem quadras disponíveis em um determinado dia.

- **URL da Rota:** `/find-all-in-day`

- **Método:** `GET`

### Parâmetros da Solicitação

- `date` (obrigatório): Data para consultar as arenas. Deve estar no formato de data e hora.

- `latitude` (obrigatório): Latitude do usuário. Deve ser um valor numérico representando a latitude.

- `longitude` (obrigatório): Longitude do usuário. Deve ser um valor numérico representando a longitude.

- `only_available` (opcional): Se deve retornar apenas as arenas com quadras com horários disponíveis. Deve ser um valor booleano.

- `arena_id` (opcional): ID da arena. Deve ser uma string representando o ID da arena. Para filtrar por quadras que pertencem a essa arena.

- `filter` (opcional): Filtro para ordenar os resultados. Deve ser uma string contendo um dos seguintes valores: 'TIMES_NEXT' ou 'CHEAPEST_SCHEDULE'.


## Criar Reserva

Esta rota permite criar uma nova reserva para uma quadra em uma arena.

- **URL da Rota:** `/api/reservations`

- **Método:** `POST`

### Parâmetros da Solicitação

A solicitação deve conter um corpo (payload) no formato JSON com os seguintes parâmetros:

- `date` (obrigatório): Data e hora do agendamento da reserva. Deve estar no formato de data e hora.

- `court_id` (obrigatório): UUID da quadra escolhida pelo usuário.

### Exemplo de Corpo da Solicitação

```json
{
    "date": "2023-07-26T14:00:00Z",
    "court_id": "c611f19b-39ea-4d37-8a35-59ac42ec1762"
}
```

### Resposta

```json
{
    "id": "ID_da_reserva",
    "date": "Data_e_hora_do_agendamento",
    "court": "Nome_da_quadra",
    "court_id": "ID_da_quadra",
    "sport_type": "Tipo_de_esporte",
    "arena": "Nome_da_arena",
    "arena_id": "ID_da_arena",
    "status": "Status_da_reserva",
    "link": "Link_para_a_reserva (opcional)"
}
```

- ### link
    - opcional - caso retorne, redirecionar o usuário para o browser do celular, para efetuar o pagamento