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
   CSelect,
   CSwitch,
   CInput
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

   const [modalAllowedField, setModalAllowedField] = useState(1);
   const [modalTitleField, setModalTitleField] = useState('');
   const [modalCoverField, setModalCoverField] = useState('');
   const [modalDaysField, setModalDaysField] = useState([]);
   const [modalStartTimeField, setModalStartTimeField] = useState('');
   const [modalEndTimeField, setModalEndTimeField] = useState('');



   const [modalUnitList, setModalUnitList] = useState([]);
   const [modalAreaList, setModalAreaList] = useState([]);
   const [modalUnitId, setModalUnitId] = useState(0);
   const [modalAreaId, setModalAreaId] = useState(0);
   const [dateTimePicker, setDateTimePicker] = useState(new Date());

   const fields = [
      { label: 'Ativo', key: 'allowed', sorter: false },
      { label: 'Capa', key: 'cover', sorter: false },
      { label: 'Título', key: 'title' },
      { label: 'Dias de Funcionamento', key: 'days' },
      { label: 'Horário de Início', key: 'start_time' },
      { label: 'Horário de Fim', key: 'end_time' },
      { label: 'Ações', key: 'actions', _style: { width: '1px' }, sorter: false, filter: false }
   ];

   useEffect(() => {
      getList();
   }, []);

   const getList = async () => {
      setLoading(true);
      const result = await api.getAreas();
      setLoading(false);

      if (result.error === '') {
         setList(result.list);
      } else {
         alert(result.error);
      }
   }

   const handleNewButton = () => {
      setModalId('');
      setModalAllowedField(1)
      setModalTitleField('')
      setModalCoverField('')
      setModalDaysField('')
      setModalStartTimeField('')
      setModalEndTimeField('')
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

   const handleSwitchClick = () => {

   }

   const handleModalSwitchClick = () => {
      setModalAllowedField(1 - modalAllowedField)
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
                     >
                        <CIcon name="cil-check" /> Nova Área Comum
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
                           'allowed': (item) => (
                              <td>
                                 <CSwitch
                                    color= "success"
                                    checked={item.allowed}
                                    onChange={()=>handleSwitchClick(item)}
                                 />
                              </td>
                           ),
                           'cover': (item) => (
                              <td>
                                 <img src={item.cover} width={100} />
                              </td>
                           ),
                           'days': (item) => {
                              let dayWords = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                              let days = item.days.split(',')
                              let dayString = [];

                              for(let i in days){
                                 if(days[i] && dayWords[days[i]]){
                                    dayString.push(dayWords[days[i]])
                                 }
                              }

                              return(
                                 <td>
                                    {dayString.join(', ')}
                                 </td>
                              )
                           },
                           'actions': (item) => (
                              <td>
                                 <CButtonGroup>
                                    <CButton
                                       color='info'
                                       onClick={() => handleEditButton(item.id)}>Editar</CButton>
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
            <CModalHeader closeButton>{modalId === '' ? 'Novo' : 'Editar'} Área Comum</CModalHeader>
            <CModalBody>
               <CFormGroup>
                  <CLabel htmlFor='modal-unit'>Ativo</CLabel>
                  <br />
                  <CSwitch 
                     color="success"
                     checked={modalAllowedField}
                     onChange={handleModalSwitchClick}
                  />
               </CFormGroup>

               <CFormGroup>
                  <CLabel htmlFor='modal-cover'>Capa</CLabel>
                  <CInput 
                     type="file"
                     id="modal-cover"
                     name="cover"
                     placeholder="Escolha uma Imagem"
                     OnChange={(e)=>setModalCoverField(e.target.files[0])}
                  />
               </CFormGroup>

               <CFormGroup>
                  <CLabel htmlFor='modal-days'>Dias de Funcionamento</CLabel>
                  
               </CFormGroup>

               <CFormGroup>
                  <CLabel htmlFor='modal-start-time'>Horário de Início</CLabel>
                  <CInput 
                     type="time"
                     id="modal-start-time"
                     name="start_time"
                     value={modalStartTimeField}
                     OnChange={(e)=>setModalStartTimeField(e.target.value)}
                  />
               </CFormGroup>

               <CFormGroup>
                  <CLabel htmlFor='modal-end-time'>Horário de Fim</CLabel>
                  <CInput 
                     type="time"
                     id="modal-end-time"
                     name="end_time"
                     value={modalEndTimeField}
                     OnChange={(e)=>setModalEndTimeField(e.target.value)}
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