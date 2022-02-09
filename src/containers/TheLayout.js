import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { TheContent, TheSidebar, TheFooter } from './index'
import useApi from '../services/api'

const TheLayout = () => {
   const api = useApi();
   const [loading, setLoading] = useState(true);
   const history = useHistory();

   useEffect(() => {
      const checkLogin = async () => {
         //verificar se o navegador tem um token armazenado
         if(api.getToken()){
            const result = await api.validateToken();
            if(result.error === ''){ //token válido
               setLoading(false);
            } else {
               alert(result.error) //token inválido
               history.push('/login')
            }
         } else { //Não há token
            history.push('/login');
         }
      }
      checkLogin();
   }, []);

   return (
      <div className="c-app c-default-layout">
         {!loading &&
            <>
               <TheSidebar />
               <div className="c-wrapper">
                  <div className="c-body">
                     <TheContent />
                  </div>
                  <TheFooter />
               </div>
            </>
         }
      </div >
   )
}

export default TheLayout
