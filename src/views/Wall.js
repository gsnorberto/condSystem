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
   const [modalBodyField, setModalBodyField] = useState('');
   const [modalId, setModalId] = useState();
   const [modalLoading, setModalLoading] = useState(false);

   const fields = [
      { label: 'Título', key: 'title' },
      { label: 'Data de Criação', key: 'datecreated', _style: { width: '200px' } },
      { label: 'Ações', key: 'actions', _style: { width: '1px' } } //a largura de 1px na tabela faz com que a largura do componente seja proporcional a de seu conteúdo interno.
   ];

   useEffect(() => {
      getList();
   }, []);

   const getList = async () => {
      setLoading(true);
      const result = await api.getWall();
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
      setModalBodyField('');
      setShowModal(true);
   }

   const handleEditButton = (id) => {
      let index = list.findIndex(v => v.id === id);
      setModalId(list[index]['id']);
      setModalTitleField(list[index]['title']);
      setModalBodyField(list[index]['body'])

      setShowModal(true)
   }

   const handleRemoveButton = async (id) => {
      if(window.confirm('Tem certeza que deseja excluir ? ')){
         const result = await api.removeWall(id)

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

   const handleModalSave = async () => {
      if (modalTitleField && modalBodyField) {
         setModalLoading(true);
         let result;

         //Adicionar um novo item
         if (modalId === '') {
            result = await api.addWall({
               title: modalTitleField,
               body: modalBodyField
            });
         } else { //Alterar um item
            result = await api.updateWall(modalId, {
               title: modalTitleField,
               body: modalBodyField
            });
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

   return (
      <>
         <CRow>
            <CCol>
               <h2>Mural de avisos</h2>

               <CCard>
                  <CCardHeader>
                     <CButton className="btn btn-primary" onClick={handleNewButton}>
                        <CIcon name="cil-check" /> Novo Aviso
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
                           'actions': (item) => (
                              <td>
                                 <CButtonGroup>
                                    <CButton color='info' onClick={() => handleEditButton(item.id)}>Editar</CButton>
                                    <CButton color='danger' onClick={() => handleRemoveButton(item.id)}>Excluir</CButton>
                                 </CButtonGroup>
                              </td>
                           )
                        }}
                     />
                  </CCardBody>
               </CCard>
            </CCol>
         </CRow>

         <CModal show={showModal} onClose={handleCloseModal}>
            <CModalHeader closeButton>{modalId === '' ? 'Novo' : 'Editar'} Aviso</CModalHeader>

            <CModalBody>
               <CFormGroup>
                  <CLabel>Título do aviso</CLabel>
                  <CInput
                     type='text'
                     id="modal-title"
                     placeholder='Digite um título para o aviso'
                     value={modalTitleField}
                     onChange={(e) => setModalTitleField(e.target.value)}
                     disabled={modalLoading}
                  />
               </CFormGroup>

               <CFormGroup>
                  <CLabel>Corpo do aviso</CLabel>
                  <CTextarea
                     id="modal-body"
                     placeholder='Digite o conteúdo do aviso'
                     value={modalBodyField}
                     onChange={(e) => setModalBodyField(e.target.value)}
                     disabled={modalLoading}
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