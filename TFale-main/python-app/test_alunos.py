def test_create_aluno(client):
    response = client.post('/alunos', json={
        'nome': 'João Silva',
        'idade': 20,
        'curso': 'Engenharia'
    })
    assert response.status_code == 201
    assert response.json['nome'] == 'João Silva'

def test_get_aluno(client):
    response = client.post('/alunos', json={
        'nome': 'Maria Souza',
        'idade': 22,
        'curso': 'Medicina'
    })
    aluno_id = response.json['id']
    response = client.get(f'/alunos/{aluno_id}')
    assert response.status_code == 200
    assert response.json['nome'] == 'Maria Souza'

def test_update_aluno(client):
    response = client.post('/alunos', json={
        'nome': 'Carlos Pereira',
        'idade': 21,
        'curso': 'Direito'
    })
    aluno_id = response.json['id']
    response = client.put(f'/alunos/{aluno_id}', json={
        'nome': 'Carlos Pereira',
        'idade': 22,
        'curso': 'Direito'
    })
    assert response.status_code == 200
    assert response.json['idade'] == 22

def test_delete_aluno(client):
    response = client.post('/alunos', json={
        'nome': 'Ana Costa',
        'idade': 23,
        'curso': 'Arquitetura'
    })
    aluno_id = response.json['id']
    response = client.delete(f'/alunos/{aluno_id}')
    assert response.status_code == 204
    response = client.get(f'/alunos/{aluno_id}')
    assert response.status_code == 404