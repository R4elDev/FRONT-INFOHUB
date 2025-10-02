import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPrecos: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');

  // Verifica se o usuário está logado
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSendMessage = (): void => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      alert(`Pesquisando por: ${trimmedMessage}`);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleBack = (): void => {
    navigate(-1);
  };

  const handleMenuClick = (): void => {
    alert('Menu clicado! Aqui você pode adicionar um menu lateral.');
  };

  const handleOptionsClick = (): void => {
    alert('Opções abertas!');
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f5f5f5',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #F9A01B 0%, #ffb74d 100%)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          backgroundColor: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '35px'
        }}>
          <img src="/img/Adobe Express - file (1) 1 (2).png" alt="" style={{ maxWidth: '100%', maxHeight: '100%' }} />
        </div>
        <button 
          onClick={handleMenuClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          <img src="/img/Menu (1).png" alt="" />
        </button>
      </div>

      {/* Main Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        padding: '30px',
        overflow: 'hidden'
      }}>
        {/* Back Button */}
        <div 
          onClick={handleBack}
          style={{
            color: '#F9A01B',
            fontSize: '60px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '20px',
            lineHeight: 1,
            paddingTop: '10px'
          }}
        >
          ‹
        </div>

        {/* Chat Card */}
        <div style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '50px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Title Section */}
          <h1 style={{
            color: '#F9A01B',
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}>
            Chat de Preços IA
          </h1>
          <p style={{
            color: '#F9A01B',
            fontSize: '20px',
            marginBottom: '50px'
          }}>
            Compare preços instantaneamente com nossa inteligência artificial
          </p>

          {/* Messages Wrapper */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Robot Avatar */}
              <div>
                <img src="/img/Robot 3.png" alt="" style={{ width: '55px', height: '55px' }} />
              </div>

              {/* Message Content */}
              <div style={{
                flex: 1,
                borderLeft: '4px solid #ffe0b2',
                paddingLeft: '25px'
              }}>
                <div style={{
                  color: '#F9A01B',
                  fontWeight: 'bold',
                  fontSize: '24px',
                  marginBottom: '15px'
                }}>
                  16:12
                </div>
                <p style={{
                  color: '#888',
                  fontSize: '18px',
                  lineHeight: '1.8',
                  marginBottom: '25px',
                  borderRadius: '10px'
                }}>
                  Olá! Sou sua assistente de compras inteligente. Posso ajudar você a encontrar os 
                  melhores preços de qualquer produto. Digite o nome do produto que você procura!
                </p>

                {/* Message Box */}
                <div style={{
                  background: '#ffb74d',
                  padding: '30px',
                  borderRadius: '10px'
                }}>
                  <div style={{
                    color: '#000',
                    fontWeight: '600',
                    fontSize: '20px',
                    marginBottom: '8px'
                  }}>
                    Olá usuário, seja bem-vindo!
                  </div>
                  <div style={{
                    color: '#000',
                    fontSize: '18px',
                    marginBottom: '20px'
                  }}>
                    Selecione a opção que deseja escolher:
                  </div>
                  <hr style={{ backgroundColor: '#fff' }} />
                  <button 
                    onClick={handleOptionsClick}
                    style={{
                      backgroundColor: '#ffb74d',
                      border: 'none',
                      padding: '15px 25px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#000',
                      fontWeight: '600',
                      fontSize: '18px',
                      width: '100%',
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 193, 7, 0.7)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.backgroundColor = '#ffb74d';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <img src="/img/Bulleted List.png" alt="" style={{ fontSize: '24px' }} />
                    Abrir opções
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Input Container */}
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <input
              type="text"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: '15px 20px',
                border: 'none',
                backgroundColor: '#f5f5f5',
                borderRadius: '30px',
                fontSize: '16px',
                outline: 'none',
                color: '#999'
              }}
              placeholder="Digite o produto que você procura..."
            />
            <button 
              onClick={handleSendMessage}
              style={{
                backgroundColor: '#25992E',
                border: 'none',
                padding: '15px',
                width: '50px',
                height: '50px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                flexShrink: 0
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img src="/img/Vector (2).png" alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPrecos;