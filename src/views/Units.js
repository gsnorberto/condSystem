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
   CSelect,
   CInput
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

      if(modalOwnerSearchField !== ''){
         clearTimeout(timer);
         timer = setTimeout(searchUser, 1500)
      }

   }, [modalOwnerSearchField]);

   const searchUser = async () => {
      if(modalOwnerSearchField !== ''){
         const result = await api.searchUser(modalOwnerSearchField);

         if(result.error === ''){
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
      setShowModal(true);
   }

   const handleEditButton = (id) => {
      let index = list.findIndex(v => v.id === id)

      const dateFormated = convertDate(list[index]['reservation_date'])

      setModalId(list[index]['id']);
      setModalUnitId(list[index]['id_unit']);
      setModalAreaId(list[index]['id_area']);
      setDateTimePicker(new Date (dateFormated));

      setShowModal(true);
   }

   const handleRemoveButton = async (id) => {
      if (window.confirm('Tem certeza que deseja excluir? ')) {
         const result = await api.removeReservation(id)

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

   //Adicionar ou alterar um documento
   const handleModalSave = async () => {
      if (modalUnitId && modalAreaId && dateTimePicker) {
         const dateString = convertDateToString(dateTimePicker);

         setModalLoading(true);
         let result;
         let data = {
            id_unit: modalUnitId,
            id_area: modalAreaId,
            reservation_date: dateString
         }

         //Adicionar uma nova reserva
         if (modalId === '') {
            result = await api.addReservation(data);
         } else { //Alterar reserva
            result = await api.updateReservation(modalId, data);
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

   //Transformar data
   const convertDate = (date) => {
      //2022-01-30 21:00:00
      const newDate = date.replace(' ', 'T')
      return newDate;
   }

   const convertDateToString = (date) => {
      //2022-01-30 21:00:00
      
      let dia = date.getDate();
      let mes = date.getMonth()+1;
      let ano = date.getFullYear();
      let hora = date.getHours();
      let minuto = date.getMinutes();

      dia = dia < 10 ? `0${dia}` : dia;
      mes = mes < 10 ? `0${mes}` : mes;
      hora = hora < 10 ? `0${hora}` : hora;
      minuto = minuto < 10 ? `0${minuto}` : minuto;

      const dataHora = ano+'-'+mes+'-'+dia+' '+hora+':'+minuto+':'+'00'

      return dataHora;
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
                  <CInput
                     type='text'
                     id='modal-owner'
                     value={modalOwnerSearchField}
                     onChange={(e) => setModalOwnerSearchField(e.target.value)}
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