import { Button } from '../components/ui/button'
import bolalaranjacombranconomeioGrande from '../assets/bolalaranjacombranconomeioGrande.png'
import bolalaranjacombranconomeioPequena from '../assets/bolalaranjacombranconomeioPequena.png'
import homifazendocompra from '../assets/homifazendocompra.png'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  return (
    <body>
        <div className='h-[45vh] bg-white relative flex items-center justify-center'>
         <img src={bolalaranjacombranconomeioGrande} alt="bola laranja" className='absolute top-0 right-0' />
            <img src={bolalaranjacombranconomeioPequena} alt="bola laranja" className='absolute top-35 left-0' />
            <img src={homifazendocompra} alt="homem fazendo compra" className='w-auto h-[80%] object-contain' />
        </div>
        <div className='bg-[#F9A01B] relative min-h-screen'>

        </div>
    </body>

  )
}

export default Login