import pb from '@/lib/pocketbase/client'

export const getPatients = async () => {
  return await pb.collection('patients').getFullList({ sort: '-created' })
}
export const createPatient = async (data: any) => {
  return await pb.collection('patients').create(data)
}
export const updatePatient = async (id: string, data: any) => {
  return await pb.collection('patients').update(id, data)
}
export const deletePatient = async (id: string) => {
  return await pb.collection('patients').delete(id)
}

export const getAppointments = async () => {
  return await pb.collection('appointments').getFullList({ expand: 'patient' })
}
export const createAppointment = async (data: any) => {
  return await pb.collection('appointments').create(data)
}
export const updateAppointment = async (id: string, data: any) => {
  return await pb.collection('appointments').update(id, data)
}
export const deleteAppointment = async (id: string) => {
  return await pb.collection('appointments').delete(id)
}

export const getLeads = async () => {
  return await pb.collection('leads').getFullList({ expand: 'patient' })
}
export const createLead = async (data: any) => {
  return await pb.collection('leads').create(data)
}
export const updateLead = async (id: string, data: any) => {
  return await pb.collection('leads').update(id, data)
}

export const getBudgets = async () => {
  return await pb.collection('budgets').getFullList({ expand: 'patient', sort: '-created' })
}
export const createBudget = async (data: any) => {
  return await pb.collection('budgets').create(data)
}
export const updateBudget = async (id: string, data: any) => {
  return await pb.collection('budgets').update(id, data)
}
export const deleteBudget = async (id: string) => {
  return await pb.collection('budgets').delete(id)
}
