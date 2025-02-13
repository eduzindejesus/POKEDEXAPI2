const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');



// Middlewares
app.use(cors());
app.use(bodyParser.json());



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());
app.use(bodyParser.json()); // Para processar o corpo das requisições como JSON

// Rota GET para obter os Pokémons
app.get("/api/pokemons", (req, res) => {
    const pokemonData = require("./Data/pokemon.json");
    res.json(pokemonData);
});

// Rota POST para adicionar um novo Pokémon
app.post('/api/pokemons', (req, res) => {
    try {
        const { name, types, description, imageUrl } = req.body;
        
        // Validação dos campos
        if (!name || !types || !description) {
            return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
        }

        const pokemonData = require("./Data/pokemon.json");

        // Se a URL da imagem não for fornecida, usa uma URL padrão
        const pokemonImageUrl = imageUrl || "https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/043.png"; 
        
        // Adicionar o novo Pokémon ao array de Pokémons
        const newPokemon = {
            name,
            types,
            description,
            imageUrl: pokemonImageUrl
        };
        pokemonData.push(newPokemon);

        // Salvar novamente no arquivo JSON
        fs.writeFileSync('./Data/pokemon.json', JSON.stringify(pokemonData, null, 2));

        res.status(201).json(newPokemon);
    } catch (error) {
        console.error('Erro ao adicionar Pokémon:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});


// Rota de login existente
const users = [
    { username: 'usuario1', password: '1234' },
    { username: 'usuario2', password: '5678' }
];

app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        // Verifica se os campos foram preenchidos
        if (!username || !password) {
            return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
        }

        // Procura pelo usuário no "banco de dados"
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(400).json({ error: 'Usuário não encontrado.' });
        }

        // Verifica se a senha está correta
        const isPasswordCorrect = user.password === password;
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: 'Senha incorreta.' });
        }

        // Se tudo estiver correto, retorna uma mensagem de sucesso
        res.status(200).json({ message: 'Logado com sucesso!' });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});



// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


