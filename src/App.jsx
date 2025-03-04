import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Table, Input, Button, Card } from 'antd';
import { useParams } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Swal from 'sweetalert2';
import md5 from 'md5';
import 'antd/dist/reset.css';
import './App.css';

const MARVEL_PRIVATE_KEY = import.meta.env.VITE_MARVEL_API_KEY_PRIVATE;
const MARVEL_PUBLIC_KEY = import.meta.env.VITE_MARVEL_API_KEY_PUBLIC;
const ts = new Date().getTime().toString();
const hash = md5(`${ts}${MARVEL_PRIVATE_KEY}${MARVEL_PUBLIC_KEY}`);
const MARVEL_BASE_URL = `https://gateway.marvel.com/v1/public/characters?ts=${ts}&apikey=${MARVEL_PUBLIC_KEY}&hash=${hash}`;
const CAPTCHA_API_KEY = import.meta.env.VITE_RECAPTCHA_KEY

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!captchaVerified) {
      Swal.fire('Error', 'Por favor resuelve el CAPTCHA', 'error');
      return;
    }

    if (email === 'admin@admin.com' && password === 'Admin') {
      Swal.fire('Éxito', 'Inicio de sesión correcto', 'success');
      navigate('/characters');
    } else {
      Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
    }
  };

  return (
    <div className='login-container'>
      <Card title='Iniciar Sesión' className='login-card'>
        <Input placeholder='Correo' onChange={(e) => setEmail(e.target.value)} />
        <Input.Password placeholder='Contraseña' onChange={(e) => setPassword(e.target.value)} />
        <ReCAPTCHA sitekey={CAPTCHA_API_KEY} onChange={() => setCaptchaVerified(true)} />
        <Button type='primary' onClick={handleLogin} block>Ingresar</Button>
      </Card>
    </div>
  );
};

const Characters = () => {
  console.log("API Key Pública:", MARVEL_PUBLIC_KEY);
  console.log("API Key Privada:", MARVEL_PRIVATE_KEY);
  console.log("Timestamp:", ts);
  console.log("Hash:", hash);
  console.log("URL de Marvel API:", MARVEL_BASE_URL);
  
  const [characters, setCharacters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${MARVEL_BASE_URL}`)
      .then(res => res.json())
      .then(data => { console.log(data);
      
       setCharacters(data.data.results)})
      .catch(err => console.error('Error al obtener personajes', err));
  }, []);

  if (characters.length == 0) return <p>Cargando...</p>;

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      render: (text, record) => <a onClick={() => navigate(`/character/${record.id}`)}>{text}</a>
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
    }
  ];

  return (
    <div className='container'>
      <h2>Lista de Personajes de Marvel</h2>
      <Table dataSource={characters} columns={columns} rowKey='id' />
    </div>
  );
};

const CharacterDetail = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  console.log(id);
  
  useEffect(() => {
    if (!id) return;
    const ts = new Date().getTime().toString();
    const hash = md5(ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY);
    const url = `https://gateway.marvel.com/v1/public/characters/${id}?ts=${ts}&apikey=${MARVEL_PUBLIC_KEY}&hash=${hash}`;
    fetch(`${url}`)
      .then(res => res.json())
      .then(data => {console.log(data);
        if (data.data && data.data.results.length > 0) {
          setCharacter(data.data.results[0]); 
        } else {
          console.error("Personaje no encontrado");
        }
        })
      .catch(err => console.error('Error al obtener detalles', err));
  }, [id]);

  if (!character) return <p>Cargando...</p>;

  return (
    <div className='container'>
      <Card title={character.name} style={{ width: 300 }}>
        <img src={`${character.thumbnail.path}.${character.thumbnail.extension}`} alt={character.name} style={{ width: '100%' }} />
        <p>{character.description || 'Sin descripción disponible'}</p>
      </Card>
    </div>
  );
};

const App = () => {
  return (
    
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/characters' element={<Characters />} />
        <Route path='/character/:id' element={<CharacterDetail />} />
      </Routes>
   
  );
};

export default App;
