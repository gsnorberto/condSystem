import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import useApi from '../services/api';

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
   CFormGroup,
   CInput,
   CSelect
} from '@coreui/react';


export default () => {
   const api = useApi();
   let timer;

   const [loading, setLoading] = useState(true);
   const [list, setList] = useState([]);
   const [showModal, setShowModal] = useState(false);
   const [modalId, setModalId] = useState();
   const [modalLoading, setModalLoading] = useState(false);
   const [modalNameField, setModalNameField] = useState('');
   const [modalOwnerSearchField, setModalOwnerSearchField] = useState('');
   const [modalOwnerList, setModalOwnerList] = useState([]);
   const [modalOwnerField, setModalOwnerField] = useState(null);

   const [modalUnitId, setModalUnitId] = useState(0);
   const [modalAreaId, setModalAreaId] = useState(0);
   const [dateTimePicker, setDateTimePicker] = useState(new Date());

   const fields = [
      { label: 'Unidade', key: 'name', sorter: false },
      { label: 'Proprietário', key: 'name_owner', sorter: false },
      { label: 'Ações', key: 'actions', _style: { width: '1px' }, sorter: false, filter: false }
   ];

   useEffect(() => {
      getList();
   }, []);

   useEffect(() => {

      if (modalOwnerSearchField !== '') {
         clearTimeout(timer);
         timer = setTimeout(searchUser, 1500)
      }

   }, [modalOwnerSearchField]);

   const searchUser = async () => {
      if (modalOwnerSearchField !== '') {
         const result = await api.searchUser(modalOwnerSearchField);

         if (result.error === '') {
            setModalOwnerList(result.list);
         } else {
            alert(result.error)
         }

         //2:30
      }
   }

   const getList = async () => {
      setLoading(true);
      const result = await api.getUnits();
      setLoading(false);

      if (result.error === '') {
         setList(result.list);
      } else {
         alert(result.error);
      }
   }

   const handleNewButton = () => {
      setModalId('');
      setModalNameField('')
      setModalOwnerField(null)
      setModalOwnerList([])
      setModalOwnerSearchField('')
      setShowModal(true);
   }

   const handleEditButton = (id) => {
      let index = list.findIndex(v => v.id === id)

      setModalId(list[index]['id']);
      setModalNameField(list[index]['name'])
      setModalOwnerList([]);
      setModalOwnerSearchField('');

      if(list[index]['name_owner']){
         setModalOwnerField({
            name: list[index]['name_owner'],
            id: list[index]['id_owner']
         });
      } else {
         setModalOwnerField(null)
      }

      setShowModal(true);
   }

   const handleRemoveButton = async (id) => {
      if (window.confirm('Tem certeza que deseja excluir? ')) {
         const result = await api.removeUnit(id)

         if (result.error === '') {
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
      if (modalNameField) {

         setModalLoading(true);
         let result;
         let data = {
            name: modalNameField,
            id_owner: modalOwnerField.id
         }

         if (modalId === '') {
            result = await api.addUnit(data);
         } else { 
            result = await api.updateUnit(modalId, data);
         }

         setModalLoading(false);

         if (result.error === '') {
            setShowModal(false);
            getList();
         } else {
            alert(result.error);
         }
      } else {
         alert('Preencha os campos!')
      }
   }

   const selectModalOwnerField = (id) => {
      let item = modalOwnerList.find(item => item.id == id)

      setModalOwnerField(item);
      setModalOwnerList([]);
      setModalOwnerSearchField('');
   }

   return (
      <>
         {/* ********** UNIDADES - PÁGINA ********** */}
         <CRow>
            <CCol>
               <h2>Unidades</h2>
               <CCard>
                  <CCardHeader>
                     <CButton
                        className="btn btn-primary"
                        onClick={handleNewButton}
                     >
                        <CIcon name="cil-check" /> Nova Unidade
                     </CButton>
                  </CCardHeader>

                  <CCardBody>
                     <CDataTable
                        items={list}
                        fields={fields}
                        loading={loading}
                        noItemsViewSlot=" "
                        columnFilter
                        sorter
                        hover
                        striped
                        bordered
                        pagination
                        itemsPerPage={10}
                        scopedSlots={{
                           'name_owner': (item) => (
                              <td>
                                 {item.name_owner ?? '-'}
                              </td>
                           ),
                           'actions': (item) => (
                              <td>
                                 <CButtonGroup>
                                    <CButton color='success' onClick={null}>Detalhes</CButton>
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

         {/* **************** MODAL **************** */}
         <CModal show={showModal} onClose={handleCloseModal}>
            <CModalHeader closeButton>{modalId === '' ? 'Novo' : 'Editar'} Reserva</CModalHeader>
            <CModalBody>
               
               <CFormGroup>
                  <CLabel htmlFor='modal-date'>Nome da unidade: </CLabel>
                  <CInput
                     type='text'
                     id='modal-name'
                     value={modalNameField}
                     onChange={(e) => setModalNameField(e.target.value)}
                  />
               </CFormGroup>

               <CFormGroup>
                  <CLabel htmlFor='modal-date'>Proprietário (Nome/CPF/E-mail)</CLabel>
                  {modalOwnerField === null &&
                     <>
                        <CInput
                           type='text'
                           id='modal-owner'
                           value={modalOwnerSearchField}
                           onChange={(e) => setModalOwnerSearchField(e.target.value)}
                        />

                        {modalOwnerList.length > 0 &&
                           <CSelect
                              sizeHtml={5}
                              onChange={e => selectModalOwnerField(e.target.value)}
                           >
                              {modalOwnerList.map((item, index) => (
                                 <option key={index} value={item.id}>{item.name}</option>
                              ))}
                           </CSelect>
                        }
                     </>
                  }

                  {modalOwnerField !== null &&
                     <>
                        <br />
                        <CButton
                           size='sm'
                           color='danger'
                           onClick={ ()=> setModalOwnerField(null) }
                        >X</CButton>

                        {modalOwnerField.name}
                     </>
                  }
               </CFormGroup>
            </CModalBody>

            {/* BOTÕES DO MODAL */}
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