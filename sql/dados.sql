INSERT INTO faculdade (nome, cidade, estado) VALUES
('Universidade Federal de Tecnologia (UFT)', 'Maceió', 'AL');

INSERT INTO curso (nome, duracao_semestres, faculdade_id) VALUES
('Ciência da Computação', 8, 1),
('Engenharia Civil', 10, 1),
('Administração', 8, 1);

INSERT INTO disciplina (nome, carga_horaria, curso_id) VALUES
('Algoritmos e Estruturas de Dados', 80, 1),
('Banco de Dados', 60, 1),
('Resistência dos Materiais', 80, 2),
('Cálculo Estrutural', 100, 2),
('Gestão Financeira', 60, 3),
('Marketing Corporativo', 60, 3);

INSERT INTO aluno (nome, email, data_nascimento, curso_id) VALUES
('Ana Clara Silva', 'ana.silva@email.com', '2003-05-12', 1),
('Bruno Souza', 'bruno.souza@email.com', '2002-09-20', 1),
('Carlos Eduardo', 'carlos.eduardo@email.com', '2004-01-15', 1),
('Daniela Lima', 'daniela.lima@email.com', '2001-11-30', 1),
('Erick Santos', 'erick.santos@email.com', '2003-07-08', 1),
('Fernanda Costa', 'fernanda.costa@email.com', '2002-03-25', 1),
('Gabriel Oliveira', 'gabriel.oliveira@email.com', '2004-06-18', 1),
('Helena Ribeiro', 'helena.ribeiro@email.com', '2001-12-05', 1),
('Igor Martins', 'igor.martins@email.com', '2003-04-22', 2),
('Júlia Almeida', 'julia.almeida@email.com', '2002-08-14', 2),
('Kaique Barbosa', 'kaique.barbosa@email.com', '2004-02-10', 2),
('Larissa Mendes', 'larissa.mendes@email.com', '2001-10-01', 2),
('Matheus Rocha', 'matheus.rocha@email.com', '2003-06-29', 2),
('Natália Farias', 'natalia.farias@email.com', '2002-01-19', 2),
('Otávio Ramos', 'otavio.ramos@email.com', '2004-09-03', 2),
('Priscila Nogueira', 'priscila.nogueira@email.com', '2001-05-27', 3),
('Rafael Vieira', 'rafael.vieira@email.com', '2003-10-11', 3),
('Sabrina Freitas', 'sabrina.freitas@email.com', '2002-04-07', 3),
('Thiago Cardoso', 'thiago.cardoso@email.com', '2004-12-21', 3),
('Vitória Castro', 'vitoria.castro@email.com', '2001-08-16', 3),
('Lucas Azevedo', 'lucas.azevedo@email.com', '2003-02-28', 1),
('Mariana Duarte', 'mariana.duarte@email.com', '2002-11-11', 1),
('Pedro Henrique', 'pedro.henrique@email.com', '2004-07-14', 2),
('Beatriz Lima', 'beatriz.lima@email.com', '2001-03-09', 2),
('João Victor', 'joao.victor@email.com', '2003-09-17', 3);
