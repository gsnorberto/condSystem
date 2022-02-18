import React, { useState, useEffect } from 'react';
import DateTimePicker from 'react-datetime-picker';

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
   CSelect
} from '@coreui/react';
import CIcon from '@coreui/icons-react';

import useApi from '../services/api';

export default () => {
   const api = useApi();

   const [loading, setLoading] = useState(true);
   const [list, setList] = useState([]);
   const [showModal, setShowModal] = useState(false);
   const [modalId, setModalId] = useState();
   const [modalLoading, setModalLoading] = useState(false);
   const [modalUnitList, setModalUnitList] = useState([]);
   const [modalAreaList, setModalAreaList] = useState([]);
   const [modalUnitId, setModalUnitId] = useState(0);
   const [modalAreaId, setModalAreaId] = useState(0);
   const [dateTimePicker, setDateTimePicker] = useState(new Date());

   const fields = [
      { label: 'Unidade', key: 'name_unit', sorter: false },
      { label: 'Área', key: 'name_area', sorter: false },
      { label: 'Data da reserva', key: 'reservation_date' },
      { label: 'Ações', key: 'actions', _style: { width: '1px' }, sorter: false, filter: false } //a largura de 1px na tabela faz com que a largura do componente seja proporcional a de seu conteúdo interno.
   ];

   //Obter lista de reservas, lista das unidades e áreas disponíveis no condomínio.
   useEffect(() => {
      getList();
      getUnitList();
      getAreaList();
   }, []);

   //Obter lista de Reservas do BD
   const getList = async () => {
      setLoading(true);
      const result = await api.getReservations();
      setLoading(false);

      if (result.error === '') {
         setList(result.list);
      } else {
         alert(result.error);
      }
   }

   const getUnitList = async () => {
      const result = await api.getUnits();

      if (result.error === '') {
         setModalUnitList(result.list)
      }

   }

   const getAreaList = async () => {
      const result = await api.getAreas();

      if (result.error === '') {
         setModalAreaList(result.list)
      }

   }

   const handleNewButton = () => {
      setModalId('');
      setModalUnitId(modalUnitList[0]['id']);
      setModalAreaId(modalAreaList[0]['id']);
      setDateTimePicker(new Date());
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
         {/* ********** RESERVAS - PÁGINA ********** */}
         <CRow>
            <CCol>
               <h2>Áreas Comuns</h2>
               {/* {console.log(convertDateToString(dateTimePicker))} */}
               <CCard>
                  <CCardHeader>
                     <CButton
                        className="btn btn-primary"
                        onClick={handleNewButton}
                        disabled={modalUnitList.length === 0 || modalAreaList.length === 0}
                     >
                        <CIcon name="cil-check" /> Nova Reserva
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
                           'reservation_date': (item) => (
                              <td>
                                 {item.reservation_date_formatted}
                              </td>
                           ),
                           'actions': (item) => (
                              <td>
                                 <CButtonGroup>
                                    <CButton
                                       color='info'
                                       onClick={() => handleEditButton(item.id)}
                                       disabled={modalUnitList.length === 0 || modalAreaList.length === 0}
                                    >Editar</CButton>
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
                  <CLabel htmlFor='modal-unit'>Unidade</CLabel>
                  <CSelect
                     id="modal-unit"
                     custom
                     onChange={e => setModalUnitId(e.target.value)}
                     value={modalUnitId}
                  >
                     {modalUnitList.map((item, index) => (
                        <option
                           key={index}
                           value={item.id}
                        >{item.name}</option>
                     ))}
                  </CSelect>
               </CFormGroup>

               <CFormGroup>
                  <CLabel htmlFor='modal-area'>Área</CLabel>
                  <CSelect
                     id="modal-area"
                     custom
                     onChange={e => setModalAreaId(e.target.value)}
                     value={modalAreaId}
                  >
                     {modalAreaList.map((item, index) => (
                        <option
                           key={index}
                           value={item.id}
                        >{item.title}</option>
                     ))}
                  </CSelect>
               </CFormGroup>

               <CFormGroup>
                  <CLabel htmlFor='modal-date'>Data da Reserva: </CLabel>
                  <DateTimePicker
                     onChange={setDateTimePicker}
                     value={dateTimePicker}
                     disabled={modalLoading}
                     id="modal-date"
                     format='dd-MM-y HH:mm'
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