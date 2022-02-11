import React, { useState, useEffect } from 'react';
import {
   CCard,
   CCardHeader,
   CCardBody,
   CCol,
   CRow,
   CButton,
   CDataTable,
   CButtonGroup,
   CModal,
   CModalHeader,
   CModalBody,
   CModalFooter,
   CLabel,
   CInput,
   CTextarea,
   CFormGroup
} from '@coreui/react';
import CIcon from '@coreui/icons-react';

import useApi from '../services/api';

export default () => {
   const api = useApi();

   const [loading, setLoading] = useState(true);
   const [list, setList] = useState([]);
   const [showModal, setShowModal] = useState(false);
   const [modalTitleField, setModalTitleField] = useState('');
   const [modalFileField, setModalFileField] = useState('');
   const [modalId, setModalId] = useState();
   const [modalLoading, setModalLoading] = useState(false);

   const fields = [
      { label: 'Título', key: 'title' },
      { label: 'Ações', key: 'actions', _style: { width: '1px' } } //a largura de 1px na tabela faz com que a largura do componente seja proporcional a de seu conteúdo interno.
   ];

   useEffect(() => {
      getList();
   }, []);

   const getList = async () => {
      setLoading(true);
      const result = await api.getDocuments();
      setLoading(false);

      if (result.error === '') {
         setList(result.list);
      } else {
         alert(result.error);
      }
   }

   const handleNewButton = () => {
      setModalId('');
      setModalTitleField('');
      setModalFileField('');
      setShowModal(true);
   }

   const handleEditButton = (index) => {
      setModalId(list[index]['id']);
      setModalTitleField(list[index]['title']);
     // setModalBodyField(list[index]['body'])

      setShowModal(true)
   }

   const handleRemoveButton = async (index) => {
      if(window.confirm('Tem certeza que deseja excluir? ')){
         const result = await api.removeDocument(list[index]['id'])

         if(result.error === ''){
            getList();
         } else {
            alert(result.error)
         }
      }
   }

   const handleCloseModal = () => {
      setShowModal(false)
   }

   //Adicionar ou alterar um documento
   const handleModalSave = async () => {
      if (modalTitleField) {
         setModalLoading(true);
         let result;
         let data = {
            title: modalTitleField
         }

         //Adicionar um novo arquivo
         if (modalId === '') {
            if(modalFileField){
               data.file = modalFileField;
               result = await api.addDocument(data);
            } else {
               alert("Selecione o Arquivo");
               setModalLoading(false);
               return;
            }
         } else { //Alterar um item
            //Na edição de um item, o arquivo é opcional
            if(modalFileField) {
               data.file = modalFileField
            }
            result = await api.updateDocument(modalId, data);
         }

         setModalLoading(false);

         if (result.error === '') {
            setShowModal(false);
            getList(); //atualiza a lista sem precisar atualizar a tela inteira
         } else {
            alert(result.error);
         }
      } else {
         alert('Preencha os campos!')
      }
   }

   //Abrir o pdf do Documento
   const handleDownloadButton = (index) => {
      window.open(list[index]['fileurl']);
   }

   return (
      <>
         <CRow>
            <CCol>
               <h2>Documentos</h2>

               <CCard>
                  <CCardHeader>
                     <CButton className="btn btn-primary" onClick={handleNewButton}>
                        <CIcon name="cil-check" /> Novo Documento
                     </CButton>
                  </CCardHeader>

                  <CCardBody>
                     <CDataTable
                        items={list}
                        fields={fields}
                        loading={loading}
                        noItemsViewSlot=" "
                        hover
                        striped
                        bordered
                        pagination
                        itemsPerPage={2}
                        scopedSlots={{
                           'actions': (item, index) => (
                              <td>
                                 <CButtonGroup>
                                    <CButton color='success' onClick={()=>handleDownloadButton(index)}>
                                       <CIcon name='cil-cloud-download' />
                                    </CButton>
                                    <CButton color='info' onClick={() => handleEditButton(index)}>Editar</CButton>
                                    <CButton color='danger' onClick={() => handleRemoveButton(index)}>Excluir</CButton>
                                 </CButtonGroup>
                              </td>
                           )
                        }}
                     />
                  </CCardBody>
               </CCard>
            </CCol>
         </CRow>
         
         {/* **************** MODAL **************** */}
         <CModal show={showModal} onClose={handleCloseModal}>
            <CModalHeader closeButton>{modalId === '' ? 'Novo' : 'Editar'} Documento</CModalHeader>

            <CModalBody>
               <CFormGroup>
                  <CLabel>Título do documento</CLabel>
                  <CInput
                     type='text'
                     id="modal-title"
                     placeholder='Digite um título para o documento'
                     value={modalTitleField}
                     onChange={(e) => setModalTitleField(e.target.value)}
                     disabled={modalLoading}
                  />
               </CFormGroup>

               <CFormGroup>
                  <CLabel>Arquivo (pdf)</CLabel>
                  <CInput
                     type='file'
                     id='modal-file'
                     name='file'
                     placeholder='Escolha um Arquivo'
                     onChange={e=>setModalFileField(e.target.files[0])}
                  />
               </CFormGroup>
            </CModalBody>

            <CModalFooter>
               <CButton color='primary' onClick={handleModalSave} disabled={modalLoading}>
                  {modalLoading ? 'Carregando...' : 'Salvar'}
               </CButton>
               <CButton color='secundary' onClick={handleCloseModal} disabled={modalLoading}>
                  Cancelar
               </CButton>
            </CModalFooter>
         </CModal>
      </>
   );
}