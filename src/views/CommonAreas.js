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
   CSwitch,
   CInput,
   CInputCheckbox
}from '@coreui/react';


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

   const fields = [
      { label: 'Ativo', key: 'allowed', filter: false, sorter: false },
      { label: 'Capa', key: 'cover', filter: false, sorter: false },
      { label: 'Título', key: 'title' },
      { label: 'Dias de Funcionamento', key: 'days' },
      { label: 'Horário de Início', key: 'start_time', filter: false },
      { label: 'Horário de Fim', key: 'end_time', filter: false },
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

      setModalId(list[index]['id']);
      setModalAllowedField(list[index]['allowed']);
      setModalTitleField(list[index]['title']);
      setModalCoverField();
      setModalDaysField(list[index]['days'].split(','));
      setModalStartTimeField(list[index]['start_time']);
      setModalEndTimeField(list[index]['end_time']);

      setShowModal(true);
   }

   const handleRemoveButton = async (id) => {
      if (window.confirm('Tem certeza que deseja excluir? ')) {
         const result = await api.removeArea(id)

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
      if (modalTitleField && modalStartTimeField && modalEndTimeField) {
         // const dateString = convertDateToString(dateTimePicker);

         setModalLoading(true);
         let result;
         let data = {
            allowed: modalAllowedField,
            title: modalTitleField,
            days: modalDaysField.join(','),
            start_time: modalStartTimeField,
            end_time: modalEndTimeField
         }

         if(modalCoverField){
            data.cover = modalCoverField;
         }

         if (modalId === '') {
            result = await api.addArea(data);
         } else {
            result = await api.updateArea(modalId, data);
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

   const handleSwitchClick = async (item) => {
      setLoading(true)
      const result = await api.updateAreaAllowed(item.id)
      setLoading(false)

      if(result.error === ''){
         getList();
      } else {
         alert(result.error)
      }
   }

   const handleModalSwitchClick = () => {
      setModalAllowedField(1 - modalAllowedField)
   }

   const toogleModalDays = (item, event) => {
      let days = [...modalDaysField];

      if(event.target.checked === false){
         days = days.filter(day => day != item)
      } else {
         days.push(item);
      }

      setModalDaysField(days)
   }

   return (
      <>
         {/* ********** RESERVAS - PÁGINA ********** */}
         <CRow>
            <CCol>
               <h2>Áreas Comuns</h2>
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
                                    color="success"
                                    checked={item.allowed}
                                    onChange={() => handleSwitchClick(item)}
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

                              for (let i in days) {
                                 if (days[i] && dayWords[days[i]]) {
                                    dayString.push(dayWords[days[i]])
                                 }
                              }

                              return (
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

               {/* Foto da Capa */}
               <CFormGroup>
                  <CLabel htmlFor='modal-title'>Título</CLabel>
                  <CInput
                     type="text"
                     id="modal-title"
                     name="title"
                     value={modalTitleField}
                     onChange={(e) => setModalTitleField(e.target.value)}
                  />
               </CFormGroup>
               
               {/* Foto da Capa */}
               <CFormGroup>
                  <CLabel htmlFor='modal-cover'>Capa</CLabel>
                  <CInput
                     type="file"
                     id="modal-cover"
                     name="cover"
                     placeholder="Escolha uma Imagem"
                     onChange={(e) => setModalCoverField(e.target.files[0])}
                  />
               </CFormGroup>
               
               {/* Dias de Funcionamento */}
               <CFormGroup>
                  <CLabel htmlFor='modal-days'>Dias de Funcionamento</CLabel>
                  <div style={{marginLeft:20}}>
                     <div>
                        <CInputCheckbox
                           id="modal-days-0"
                           name="modal-days"
                           value={0}
                           checked={modalDaysField.includes('0')}
                           onChange={(e)=>toogleModalDays('0', e)}
                        />
                        <CLabel htmlFor="modal-days-0">Segunda-Feira</CLabel>
                     </div>
                     <div>
                        <CInputCheckbox
                           id="modal-days-1"
                           name="modal-days"
                           value={1}
                           checked={modalDaysField.includes('1')}
                           onChange={(e)=>toogleModalDays('1', e)}
                        />
                        <CLabel htmlFor="modal-days-1">Terça-Feira</CLabel>
                     </div>
                     <div>
                        <CInputCheckbox
                           id="modal-days-2"
                           name="modal-days"
                           value={2}
                           checked={modalDaysField.includes('2')}
                           onChange={(e)=>toogleModalDays('2', e)}
                        />
                        <CLabel htmlFor="modal-days-2">Quarta-Feira</CLabel>
                     </div>
                     <div>
                        <CInputCheckbox
                           id="modal-days-3"
                           name="modal-days"
                           value={3}
                           checked={modalDaysField.includes('3')}
                           onChange={(e)=>toogleModalDays('3', e)}
                        />
                        <CLabel htmlFor="modal-days-3">Quinta-Feira</CLabel>
                     </div>
                     <div>
                        <CInputCheckbox
                           id="modal-days-4"
                           name="modal-days"
                           value={4}
                           checked={modalDaysField.includes('4')}
                           onChange={(e)=>toogleModalDays('4', e)}
                        />
                        <CLabel htmlFor="modal-days-4">Sexta-Feira</CLabel>
                     </div>
                     <div>
                        <CInputCheckbox
                           id="modal-days-5"
                           name="modal-days"
                           value={5}
                           checked={modalDaysField.includes('5')}
                           onChange={(e)=>toogleModalDays('5', e)}
                        />
                        <CLabel htmlFor="modal-days-5">Sábado</CLabel>
                     </div>
                     <div>
                        <CInputCheckbox
                           id="modal-days-6"
                           name="modal-days"
                           value={6}
                           checked={modalDaysField.includes('6')}
                           onChange={(e)=>toogleModalDays('6', e)}
                        />
                        <CLabel htmlFor="modal-days-6">Domingo</CLabel>
                     </div>
                  </div>
               </CFormGroup>
               
               {/* Horário de Início */}
               <CFormGroup>
                  <CLabel htmlFor='modal-start-time'>Horário de Início</CLabel>
                  <CInput
                     type="time"
                     id="modal-start-time"
                     name="start_time"
                     value={modalStartTimeField}
                     onChange={(e) => setModalStartTimeField(e.target.value)}
                  />
               </CFormGroup>

               {/* Horário de Fim */}
               <CFormGroup>
                  <CLabel htmlFor='modal-end-time'>Horário de Fim</CLabel>
                  <CInput
                     type="time"
                     id="modal-end-time"
                     name="end_time"
                     value={modalEndTimeField}
                     onChange={(e) => setModalEndTimeField(e.target.value)}
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