import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import useApi from '../services/api'

import {
   CAlert,
   CButton,
   CCard,
   CCardBody,
   CCardGroup,
   CCol,
   CContainer,
   CForm,
   CInput,
   CInputGroup,
   CInputGroupPrepend,
   CInputGroupText,
   CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const Login = () => {
   const api = useApi();
   const history = useHistory();

   const [email, setEmail] = useState();
   const [password, setPassword] = useState();
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

   const handleLoginButton = async () => {

      if (email && password) {
         setLoading(true);
         const result = await api.login(email, password);
         setLoading(false);

         if (result.error === '') { //Armazena o token no navegador
            localStorage.setItem('token', result.token)
            history.push('/');
         } else {
            setError(result.error);
         }
      } else {
         setError("Preencha todos os campos")
      }
   }

   return (
      <div className="c-app c-default-layout flex-row align-items-center">
         <CContainer>
            <CRow className="justify-content-center">
               <CCol md="5">
                  <CCardGroup>
                     <CCard className="p-4">
                        <CCardBody>
                           <CForm>
                              <h1>Login</h1>
                              <p className="text-muted">Digite seus dados de usuário</p>

                              {error !== '' &&
                                 <CAlert color='danger'>{error}</CAlert>
                              }

                              <CInputGroup className="mb-3">
                                 <CInputGroupPrepend>
                                    <CInputGroupText>
                                       <CIcon name="cil-user" />
                                    </CInputGroupText>
                                 </CInputGroupPrepend>
                                 <CInput
                                    type="email"
                                    placeholder="E-mail"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={loading}
                                 />
                              </CInputGroup>

                              <CInputGroup className="mb-4">
                                 <CInputGroupPrepend>
                                    <CInputGroupText>
                                       <CIcon name="cil-lock-locked" />
                                    </CInputGroupText>
                                 </CInputGroupPrepend>
                                 <CInput
                                    type="password"
                                    placeholder="Senha"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={loading}
                                 />
                              </CInputGroup>

                              <CRow>
                                 <CCol xs="6">
                                    <CButton
                                       color="primary"
                                       className="px-4"
                                       onClick={handleLoginButton}
                                       disabled={loading}
                                    >
                                       {loading ? 'Carregando' : 'Entrar'}
                                    </CButton>
                                 </CCol>
                              </CRow>
                           </CForm>
                        </CCardBody>
                     </CCard>
                  </CCardGroup>
               </CCol>
            </CRow>
         </CContainer>
      </div>
   )
}

export default Login
