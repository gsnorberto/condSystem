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
   const [modalTitleField, setModalTitleField] = useState('');
   const [modalFileField, setModalFileField] = useState('');
   const [modalId, setModalId] = useState();
   const [modalLoading, setModalLoading] = useState(false);
   const [modalUnitList, setModalUnitList] = useState([]);
   const [modalAreaList, setModalAreaList] = useState([]);
   const [modalUnitId, setModalUnitId] = useState(0);
   const [modalAreaId, setModalAreaId] = useState(0);
   const [modalDateField, setModalDateField] = useState('');
   const [modalDateConvert, setModalDateConvert] = useState(new Date);

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
      setModalDateField('');
      setShowModal(true);
   }

   const handleEditButton = (index) => {
      //const dataConvertida = convertDate(list[index]['reservation_date'])

      setModalId(list[index]['id']);
      setModalUnitId(list[index]['id_unit']);
      setModalAreaId(list[index]['id_area']);
      setModalDateField(list[index]['reservation_date']);

      //setModalDateConvert(dataConvertida)
      // setModalBodyField(list[index]['body'])

      setShowModal(true);
   }

   const handleRemoveButton = async (index) => {
      if (window.confirm('Tem certeza que deseja excluir? ')) {
         const result = await api.removeDocument(list[index]['id'])

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
      if (modalTitleField) {
         setModalLoading(true);
         let result;
         let data = {
            title: modalTitleField
         }

         //Adicionar um novo arquivo
         if (modalId === '') {
            if (modalFileField) {
               data.file = modalFileField;
               result = await api.addDocument(data);
            } else {
               alert("Selecione o Arquivo");
               setModalLoading(false);
               return;
            }
         } else { //Alterar um item
            //Na edição de um item, o arquivo é opcional
            if (modalFileField) {
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

   //Transformar data
   const convertDate = (date) => {
      const [data, hora] = date.split(' ');
      const [ano, mes, dia] = data.split('-');
      const [hor, min, seg] = hora.split(':');


      const dataFormatada = new Date(data)

      console.log(dataFormatada)
   }

   return (
      <>
         {/* ********** RESERVAS - PÁGINA ********** */}
         <CRow>
            <CCol>
               <h2>Reservas</h2>
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
                        itemsPerPage={6}
                        scopedSlots={{
                           'reservation_date': (item) => (
                              <td>
                                 {item.reservation_date_formatted}
                              </td>
                           ),
                           'actions': (item, index) => (
                              <td>
                                 <CButtonGroup>
                                    <CButton
                                       color='info'
                                       onClick={() => handleEditButton(index)}
                                       disabled={modalUnitList.length === 0 || modalAreaList.length === 0}
                                    >Editar</CButton>
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
            <CModalHeader closeButton>{modalId === '' ? 'Novo' : 'Editar'} Reserva</CModalHeader>
            {convertDate('2022-01-30 21:00:00')}
            <CModalBody>
               <CFormGroup>
                  <CLabel htmlFor='modal-unit'>Unidade</CLabel>
                  <CSelect
                     id="modal-unit"
                     custom
                     onChange={e => setModalUnitId(e.target.value)}
                  >
                     {modalUnitList.map((item, index) => (
                        <option
                           key={index}
                           value={item.id}
                           selected={item.id === modalUnitId}
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
                  >
                     {modalAreaList.map((item, index) => (
                        <option
                           key={index}
                           value={item.id}
                           selected={item.id === modalAreaId}
                        >{item.title}</option>
                     ))}
                  </CSelect>
               </CFormGroup>

               <CFormGroup>
                  <CLabel htmlFor='modal-date'>Data da Reserva</CLabel>
                  <CInput
                     type='text'
                     id="modal-date"
                     value={modalDateField}
                     onChange={(e) => setModalDateField(e.target.value)}
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