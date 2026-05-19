import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from './lib/supabase'
import { 
  Scissors, Calendar, DollarSign, Clock, Users, 
  Plus, Loader2, ArrowUpRight, ArrowDownRight, Wallet, Trash2, 
  Settings, LogOut, Search, Eye, EyeOff, Check, X, Tag, User, 
  RefreshCw
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface Service {
  id: string
  nome: string
  preco: number
}

interface Appointment {
  id: string
  customer: string
  services: Service[]
  date: string
  time: string
  totalPrice: number
  status: string
}

interface Customer {
  id: string
  nome: string
  email?: string
}

export default function App() {
  const [authState, setAuthState] = useState<'loading' | 'login' | 'main'>('loading')
  const [currentTab, setCurrentTab] = useState<'home' | 'agenda' | 'finance' | 'customers' | 'services' | 'settings'>('home')
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const [globalLoading, setGlobalLoading] = useState(false)

  // Auth States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Dashboard & Business Data States
  const [stats, setStats] = useState({
    totalClients: 0,
    monthAppointments: 0,
    monthlyBalance: 0,
    grossRevenue: 0
  })
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [pauses, setPauses] = useState<any[]>([])
  const [chartData, setChartData] = useState<number[]>(new Array(12).fill(0))

  // Selected date for Agenda
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Modals States
  const [showAppModal, setShowAppModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  // Form States
  const [appFormData, setAppFormData] = useState({
    customerName: '',
    time: '10:00',
    date: new Date().toISOString().split('T')[0],
    selectedServiceIds: [] as string[]
  })
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    value: '',
    category: 'Suprimentos',
    date: new Date().toISOString().split('T')[0]
  })
  const [pauseFormData, setPauseFormData] = useState({
    reason: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [serviceFormData, setServiceFormData] = useState({
    id: '',
    nome: '',
    preco: ''
  })
  const [customerFormData, setCustomerFormData] = useState({
    nome: '',
    email: ''
  })

  // Search Filters
  const [customerSearch, setCustomerSearch] = useState('')
  const [serviceSearch, setServiceSearch] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setUserName(session.user.user_metadata?.nome || 'Gerente')
        setAuthState('main')
        fetchEstablishmentData(session.user.id)
      } else {
        setAuthState('login')
      }
    } catch (e) {
      setAuthState('login')
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha todos os campos.')
      return
    }

    setGlobalLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      if (data.user) {
        setUser(data.user)
        setUserName(data.user.user_metadata?.nome || 'Gerente')
        toast.success('Login realizado com sucesso!')
        setAuthState('main')
        fetchEstablishmentData(data.user.id)
      }
    } catch (error: any) {
      toast.error(error.message || 'Credenciais inválidas.')
    } finally {
      setGlobalLoading(false)
    }
  }

  async function handleLogout() {
    setGlobalLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setEstablishmentId(null)
      setAuthState('login')
      toast.success('Sessão encerrada.')
    } catch (e) {
      toast.error('Erro ao sair.')
    } finally {
      setGlobalLoading(false)
    }
  }

  async function fetchEstablishmentData(userId: string) {
    try {
      // Fetch establishment owned by this user
      const { data: estData, error: estError } = await supabase
        .from('estabelecimentos')
        .select('id')
        .eq('proprietario_id', userId)
        .single()

      if (estError || !estData) {
        console.warn('Nenhum estabelecimento encontrado.')
        return
      }

      setEstablishmentId(estData.id)
      refreshAllData(estData.id)
    } catch (error) {
      console.error(error)
    }
  }

  async function refreshAllData(estId: string) {
    setGlobalLoading(true)
    try {
      await Promise.all([
        fetchStats(estId),
        fetchAppointments(estId),
        fetchServices(estId),
        fetchCustomers(estId),
        fetchFinanceData(estId),
        fetchPauses(estId)
      ])
    } catch (e) {
      console.error(e)
    } finally {
      setGlobalLoading(false)
    }
  }

  async function fetchStats(estId: string) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Clientes Totais
    const { count: clientCount } = await supabase
      .from('clientes_estabelecimentos')
      .select('cliente_id', { count: 'exact', head: true })
      .eq('estabelecimento_id', estId)

    // Agendamentos do Mês
    const { count: monthAppCount } = await supabase
      .from('agendamentos')
      .select('id', { count: 'exact', head: true })
      .eq('estabelecimento_id', estId)
      .gte('data_hora', startOfMonth.toISOString())

    // Receita (Faturamento de agendamentos PAGO)
    const { data: incomeData } = await supabase
      .from('agendamentos')
      .select('pagamentos!inner(valor)')
      .eq('estabelecimento_id', estId)
      .eq('pagamentos.status', 'PAGO')
      .gte('pagamentos.pago_em', startOfMonth.toISOString())

    const totalIncome = incomeData?.reduce((acc: number, curr: any) => {
      const pays = Array.isArray(curr.pagamentos) ? curr.pagamentos : [curr.pagamentos]
      return acc + pays.reduce((pAcc: number, p: any) => pAcc + Number(p.valor), 0)
    }, 0) || 0

    // Despesas do Mês
    const { data: expenseData } = await supabase
      .from('despesas')
      .select('valor')
      .eq('estabelecimento_id', estId)
      .gte('data', startOfMonth.toISOString().split('T')[0])

    const totalExpense = expenseData?.reduce((acc: number, curr: any) => acc + Number(curr.valor), 0) || 0

    setStats({
      totalClients: clientCount || 0,
      monthAppointments: monthAppCount || 0,
      monthlyBalance: totalIncome - totalExpense,
      grossRevenue: totalIncome
    })
  }

  async function fetchAppointments(estId: string) {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        usuarios!agendamentos_cliente_id_fkey(nome)
      `)
      .eq('estabelecimento_id', estId)
      .order('data_hora', { ascending: true })

    if (error) throw error

    if (data) {
      const mapped: Appointment[] = data.map((app: any) => {
        const dt = new Date(app.data_hora)
        return {
          id: app.id,
          customer: app.usuarios?.nome || 'Cliente',
          services: app.servicos || [],
          date: dt.toISOString().split('T')[0],
          time: dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          totalPrice: app.preco_total || 0,
          status: app.status
        }
      })

      setAllAppointments(mapped)

      // Filter today's appointments
      const todayStr = new Date().toISOString().split('T')[0]
      setTodayAppointments(mapped.filter(a => a.date === todayStr))
    }
  }

  async function fetchServices(estId: string) {
    const { data } = await supabase
      .from('servicos')
      .select('*')
      .eq('estabelecimento_id', estId)
      .order('nome', { ascending: true })

    if (data) setServices(data)
  }

  async function fetchCustomers(estId: string) {
    const { data } = await supabase
      .from('clientes_estabelecimentos')
      .select(`
        cliente_id,
        usuarios!clientes_estabelecimentos_cliente_id_fkey(id, nome, email)
      `)
      .eq('estabelecimento_id', estId)

    if (data) {
      const mapped: Customer[] = data.map((c: any) => ({
        id: c.usuarios?.id,
        nome: c.usuarios?.nome || 'Cliente',
        email: c.usuarios?.email
      })).sort((a, b) => a.nome.localeCompare(b.nome))

      setCustomers(mapped)
    }
  }

  async function fetchFinanceData(estId: string) {
    // Recent despesas and recent agendamentos
    const [incRes, expRes] = await Promise.all([
      supabase.from('agendamentos').select('id, preco_total, data_hora, status, usuarios!agendamentos_cliente_id_fkey(nome)').eq('estabelecimento_id', estId).order('data_hora', { ascending: false }).limit(10),
      supabase.from('despesas').select('id, valor, descricao, data, categoria').eq('estabelecimento_id', estId).order('data', { ascending: false }).limit(10)
    ])

    const combined = [
      ...(incRes.data?.map((i: any) => ({
        id: i.id,
        title: `Serviço: ${i.usuarios?.nome || 'Cliente'}`,
        category: 'Agendamento',
        date: new Date(i.data_hora).toLocaleDateString('pt-BR'),
        rawDate: new Date(i.data_hora).toISOString().split('T')[0],
        value: Number(i.preco_total || 0),
        type: 'income'
      })) || []),
      ...(expRes.data?.map((e: any) => ({
        id: e.id,
        title: e.descricao,
        category: e.categoria || 'Despesa',
        date: new Date(e.data + 'T00:00:00').toLocaleDateString('pt-BR'),
        rawDate: e.data,
        value: Number(e.valor),
        type: 'expense'
      })) || [])
    ].sort((a, b) => b.rawDate.localeCompare(a.rawDate))

    setTransactions(combined.slice(0, 15))

    // Chart Data (12 months billing)
    const { data: chartAgendamentos } = await supabase
      .from('agendamentos')
      .select('preco_total, data_hora')
      .eq('estabelecimento_id', estId)
      .eq('status', 'PAGO')

    if (chartAgendamentos) {
      const monthlyValues = new Array(12).fill(0)
      chartAgendamentos.forEach((item: any) => {
        const month = new Date(item.data_hora).getMonth()
        monthlyValues[month] += Number(item.preco_total || 0)
      })
      setChartData(monthlyValues)
    }
  }

  async function fetchPauses(estId: string) {
    const { data } = await supabase
      .from('indisponibilidades')
      .select('*')
      .eq('estabelecimento_id', estId)
      .gte('data', new Date().toISOString().split('T')[0])
      .order('data', { ascending: true })

    if (data) setPauses(data)
  }

  // Agendamento Modal Save
  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault()
    if (!establishmentId) return
    if (!appFormData.customerName || appFormData.selectedServiceIds.length === 0) {
      toast.error('Preencha o nome do cliente e selecione pelo menos um serviço.')
      return
    }

    setGlobalLoading(true)
    try {
      let clientId = null

      // Check if client exists
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('nome', appFormData.customerName)
        .eq('perfil', 'CLIENTE')
        .limit(1)

      if (existingUser && existingUser.length > 0) {
        clientId = existingUser[0].id
      } else {
        // Create new mock user for the client
        const fakeEmail = `${appFormData.customerName.toLowerCase().replace(/\s+/g, '.')}.${Math.random().toString(36).substring(7)}@agendei.auto`
        const { data: newUser, error: userError } = await supabase
          .from('usuarios')
          .insert([{
            nome: appFormData.customerName,
            perfil: 'CLIENTE',
            email: fakeEmail
          }])
          .select()
          .single()

        if (userError) throw userError
        clientId = newUser.id

        // Bind client to establishment
        await supabase
          .from('clientes_estabelecimentos')
          .insert([{ cliente_id: clientId, estabelecimento_id: establishmentId }])
      }

      const servicesToAdd = services.filter(s => appFormData.selectedServiceIds.includes(s.id))
      const totalPrice = servicesToAdd.reduce((acc, curr) => acc + curr.preco, 0)
      const dataHora = `${appFormData.date}T${appFormData.time}:00`

      const { error } = await supabase
        .from('agendamentos')
        .insert([{
          cliente_id: clientId,
          estabelecimento_id: establishmentId,
          servicos: servicesToAdd,
          preco_total: totalPrice,
          data_hora: dataHora,
          status: 'APROVADO'
        }])

      if (error) throw error

      toast.success('Agendamento cadastrado com sucesso!')
      setShowAppModal(false)
      setAppFormData({ customerName: '', time: '10:00', date: new Date().toISOString().split('T')[0], selectedServiceIds: [] })
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao cadastrar agendamento: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Confirm/Cancel/Pay Actions
  async function updateAppointmentStatus(appId: string, newStatus: string) {
    if (!establishmentId) return
    setGlobalLoading(true)
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: newStatus })
        .eq('id', appId)

      if (error) throw error

      // If status is PAGO, create a payment transaction
      if (newStatus === 'PAGO') {
        const app = allAppointments.find(a => a.id === appId)
        if (app) {
          await supabase
            .from('pagamentos')
            .insert([{
              agendamento_id: appId,
              valor: app.totalPrice,
              status: 'PAGO',
              metodo: 'DINHEIRO',
              pago_em: new Date().toISOString()
            }])
        }
      }

      toast.success(`Agendamento marcado como ${newStatus.toLowerCase()}!`)
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao atualizar agendamento: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  async function handleDeleteAppointment(appId: string) {
    if (!establishmentId) return
    if (!confirm('Deseja realmente excluir este agendamento?')) return

    setGlobalLoading(true)
    try {
      // Delete payment first due to FK
      await supabase.from('pagamentos').delete().eq('agendamento_id', appId)

      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', appId)

      if (error) throw error

      toast.success('Agendamento excluído.')
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao excluir: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Create Expense Save
  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!establishmentId || !expenseFormData.description || !expenseFormData.value) return

    setGlobalLoading(true)
    try {
      const { error } = await supabase
        .from('despesas')
        .insert([{
          estabelecimento_id: establishmentId,
          descricao: expenseFormData.description,
          valor: parseFloat(expenseFormData.value.replace(',', '.')),
          categoria: expenseFormData.category,
          data: expenseFormData.date
        }])

      if (error) throw error

      toast.success('Despesa registrada!')
      setShowExpenseModal(false)
      setExpenseFormData({ description: '', value: '', category: 'Suprimentos', date: new Date().toISOString().split('T')[0] })
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao registrar despesa: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Delete Expense/Transaction
  async function handleDeleteTransaction(id: string, type: 'income' | 'expense') {
    if (!establishmentId) return
    if (!confirm('Excluir esta transação permanente?')) return

    setGlobalLoading(true)
    try {
      if (type === 'expense') {
        const { error } = await supabase.from('despesas').delete().eq('id', id)
        if (error) throw error
      } else {
        await supabase.from('pagamentos').delete().eq('agendamento_id', id)
        const { error } = await supabase.from('agendamentos').delete().eq('id', id)
        if (error) throw error
      }
      toast.success('Transação excluída.')
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao excluir: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Pause Save
  async function handleCreatePause(e: React.FormEvent) {
    e.preventDefault()
    if (!establishmentId || !pauseFormData.reason) return

    setGlobalLoading(true)
    try {
      const { error } = await supabase
        .from('indisponibilidades')
        .insert([{
          estabelecimento_id: establishmentId,
          data: pauseFormData.date,
          motivo: pauseFormData.reason
        }])

      if (error) throw error

      toast.success('Bloqueio de agenda agendado!')
      setShowPauseModal(false)
      setPauseFormData({ reason: '', date: new Date().toISOString().split('T')[0] })
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao registrar pausa: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  async function handleDeletePause(id: string) {
    if (!establishmentId) return
    setGlobalLoading(true)
    try {
      const { error } = await supabase
        .from('indisponibilidades')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Agenda desbloqueada para esta data.')
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Service Save (Create / Update)
  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault()
    if (!establishmentId || !serviceFormData.nome || !serviceFormData.preco) return

    setGlobalLoading(true)
    try {
      const payload = {
        nome: serviceFormData.nome,
        preco: parseFloat(serviceFormData.preco.replace(',', '.')),
        estabelecimento_id: establishmentId
      }

      if (serviceFormData.id) {
        const { error } = await supabase
          .from('servicos')
          .update(payload)
          .eq('id', serviceFormData.id)

        if (error) throw error
        toast.success('Serviço atualizado!')
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert([payload])

        if (error) throw error
        toast.success('Serviço criado!')
      }

      setShowServiceModal(false)
      setServiceFormData({ id: '', nome: '', preco: '' })
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao salvar serviço: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  async function handleDeleteService(id: string) {
    if (!establishmentId) return
    if (!confirm('Deseja realmente excluir este serviço?')) return

    setGlobalLoading(true)
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Serviço removido.')
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao deletar: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Create Customer Save
  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault()
    if (!establishmentId || !customerFormData.nome) return

    setGlobalLoading(true)
    try {
      const fakeEmail = `${customerFormData.nome.toLowerCase().replace(/\s+/g, '.')}.${Math.random().toString(36).substring(7)}@agendei.auto`
      const { data: newUser, error: userError } = await supabase
        .from('usuarios')
        .insert([{
          nome: customerFormData.nome,
          perfil: 'CLIENTE',
          email: customerFormData.email || fakeEmail
        }])
        .select()
        .single()

      if (userError) throw userError

      // Bind customer to establishment
      const { error } = await supabase
        .from('clientes_estabelecimentos')
        .insert([{ cliente_id: newUser.id, estabelecimento_id: establishmentId }])

      if (error) throw error

      toast.success('Cliente cadastrado com sucesso!')
      setShowCustomerModal(false)
      setCustomerFormData({ nome: '', email: '' })
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao cadastrar cliente: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Filtered Lists
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.nome.toLowerCase().includes(customerSearch.toLowerCase()))
  }, [customers, customerSearch])

  const filteredServices = useMemo(() => {
    return services.filter(s => s.nome.toLowerCase().includes(serviceSearch.toLowerCase()))
  }, [services, serviceSearch])

  const agendaAppointments = useMemo(() => {
    return allAppointments.filter(app => app.date === selectedDate)
  }, [allAppointments, selectedDate])

  const chartMax = useMemo(() => {
    const max = Math.max(...chartData)
    return max === 0 ? 1 : max
  }, [chartData])

  return (
    <div className="relative min-h-screen text-zinc-100 flex flex-col font-sans select-none overflow-x-hidden bg-zinc-950 pb-20">
      <Toaster theme="dark" position="top-center" closeButton richColors />

      {/* Global Loader Indicator */}
      {globalLoading && (
        <div className="fixed top-4 right-4 z-50 bg-[#fd9602]/20 border border-[#fd9602]/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-[#fd9602] animate-spin" />
          <span className="text-xs font-bold text-[#fd9602] uppercase tracking-wider">Carregando</span>
        </div>
      )}

      {/* RENDER BODY BASED ON AUTH STATE */}
      <AnimatePresence mode="wait">
        {authState === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center min-h-screen"
          >
            <div className="bg-[#fd9602] p-4 rounded-3xl shadow-[0_0_40px_rgba(253,150,2,0.3)] animate-pulse">
              <Scissors className="text-zinc-950 w-12 h-12" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-6 tracking-tighter">
              Agendei<span className="text-[#fd9602]">.</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-3">Carregando Sessão...</p>
          </motion.div>
        )}

        {authState === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen"
          >
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-[#fd9602]/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-zinc-800/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-3xl shadow-2xl relative">
              <div className="flex flex-col items-center mb-8">
                <div className="bg-[#fd9602] p-3 rounded-2xl shadow-[0_0_20px_rgba(253,150,2,0.25)] mb-4">
                  <Scissors className="text-zinc-950 w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Agendei<span className="text-[#fd9602]">.</span> Manager
                </h1>
                <p className="text-zinc-500 text-sm text-center mt-1">Acesse sua conta para gerenciar seu salão ou barbearia</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="gerente@agendei.app"
                    className="w-full bg-zinc-950/60 border border-white/5 rounded-2xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#fd9602] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Senha do Gerente</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-950/60 border border-white/5 rounded-2xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#fd9602] transition-colors pr-12"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary h-[54px] flex items-center justify-center font-bold text-base mt-4 shadow-lg shadow-[#fd9602]/10"
                >
                  Entrar no Painel
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {authState === 'main' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <header className="px-6 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md z-30 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#fd9602] p-1.5 rounded-lg shadow-md shadow-[#fd9602]/20">
                  <Scissors className="text-zinc-950 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Agendei<span className="text-[#fd9602]">.</span></h2>
                  <p className="text-[10px] text-[#fd9602] font-extrabold uppercase tracking-widest leading-none">Manager App</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {establishmentId ? (
                  <button 
                    onClick={() => refreshAllData(establishmentId)}
                    className="p-2 rounded-full border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-zinc-400" />
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-500 border border-white/5 rounded-full px-2 py-1 bg-zinc-900">Offline</span>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#fd9602]/10 border border-[#fd9602]/30 flex items-center justify-center text-xs font-bold text-[#fd9602]">
                    {userName.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
            </header>

            {/* TAB CONTAINER */}
            <main className="flex-1 p-6 pb-32 overflow-y-auto">
              {currentTab === 'home' && (
                <div className="space-y-6">
                  {/* Greetings */}
                  <div>
                    <h1 className="text-2xl font-black text-white">Olá, {userName}!</h1>
                    <p className="text-zinc-500 text-sm font-medium">Veja como estão as atividades do seu negócio hoje.</p>
                  </div>

                  {/* Business Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-[#fd9602]/10 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-[#fd9602]" />
                      </div>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider block">Clientes</span>
                      <span className="text-xl font-black text-white mt-1 block">{stats.totalClients}</span>
                    </div>

                    <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider block">Agendamentos</span>
                      <span className="text-xl font-black text-white mt-1 block">{stats.monthAppointments}</span>
                    </div>

                    <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl relative overflow-hidden col-span-2">
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[#fd9602]/10 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-[#fd9602]" />
                      </div>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider block">Saldo do Mês</span>
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#fd9602] mt-1 block">
                        R$ {stats.monthlyBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => {
                        setAppFormData({ customerName: '', time: '10:00', date: new Date().toISOString().split('T')[0], selectedServiceIds: [] })
                        setShowAppModal(true)
                      }}
                      className="bg-zinc-900/60 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-900/90 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#fd9602]/10 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-[#fd9602]" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300 leading-tight">Novo Corte</span>
                    </button>

                    <button 
                      onClick={() => setShowExpenseModal(true)}
                      className="bg-zinc-900/60 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-900/90 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300 leading-tight">Registrar Saída</span>
                    </button>

                    <button 
                      onClick={() => setShowPauseModal(true)}
                      className="bg-zinc-900/60 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-900/90 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300 leading-tight">Pausar Dia</span>
                    </button>
                  </div>

                  {/* Today's appointments list */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#fd9602]" />
                        Hoje na Agenda
                      </h3>
                      <button 
                        onClick={() => setCurrentTab('agenda')}
                        className="text-[11px] font-bold text-[#fd9602] hover:underline"
                      >
                        Ver agenda completa
                      </button>
                    </div>

                    {todayAppointments.length === 0 ? (
                      <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-2xl text-center">
                        <Calendar className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Nenhum agendamento para hoje</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {todayAppointments.map((app) => (
                          <div 
                            key={app.id}
                            className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-[#fd9602] font-black text-xs border border-white/5">
                                {app.time}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-zinc-200">{app.customer}</h4>
                                <p className="text-zinc-500 text-xs mt-0.5">
                                  {app.services.map(s => s.nome).join(', ')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {app.status === 'PENDENTE' && (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => updateAppointmentStatus(app.id, 'APROVADO')}
                                    className="p-2 rounded-xl bg-[#fd9602]/10 hover:bg-[#fd9602]/20 border border-[#fd9602]/20 text-[#fd9602]"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => updateAppointmentStatus(app.id, 'CANCELADO')}
                                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                              {app.status === 'APROVADO' && (
                                <button 
                                  onClick={() => updateAppointmentStatus(app.id, 'PAGO')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                                >
                                  Pagar
                                </button>
                              )}
                              {app.status === 'PAGO' && (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                  Pago
                                </span>
                              )}
                              {app.status === 'CANCELADO' && (
                                <span className="bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                  Cancelado
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentTab === 'agenda' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white">Agenda do Estabelecimento</h2>
                    <p className="text-zinc-500 text-sm">Gerencie horários e agendamentos de clientes.</p>
                  </div>

                  {/* Horizontal Scroll Date Picker */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(offset => {
                      const date = new Date()
                      date.setDate(date.getDate() + offset)
                      const dateStr = date.toISOString().split('T')[0]
                      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
                      const dayNum = date.getDate()
                      const isSelected = selectedDate === dateStr

                      return (
                        <button
                          key={offset}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`flex-shrink-0 w-14 py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                            isSelected 
                              ? 'bg-[#fd9602] text-zinc-950 shadow-lg shadow-[#fd9602]/25 font-black scale-105' 
                              : 'bg-zinc-900/40 border border-white/5 text-zinc-400 font-bold'
                          }`}
                        >
                          <span className="text-[10px] uppercase opacity-75">{dayName}</span>
                          <span className="text-base">{dayNum}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Agenda list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                      </span>
                      <button 
                        onClick={() => {
                          setAppFormData(prev => ({ ...prev, date: selectedDate }))
                          setShowAppModal(true)
                        }}
                        className="text-xs font-black text-[#fd9602] flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </button>
                    </div>

                    {agendaAppointments.length === 0 ? (
                      <div className="bg-zinc-900/20 border border-white/5 p-12 rounded-3xl text-center">
                        <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Nenhum agendamento neste dia</p>
                      </div>
                    ) : (
                      agendaAppointments.map(app => (
                        <div 
                          key={app.id}
                          className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-[#fd9602] font-black text-sm border border-white/5">
                                {app.time}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{app.customer}</h4>
                                <p className="text-zinc-400 text-xs">{app.services.map(s => s.nome).join(', ')}</p>
                              </div>
                            </div>
                            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#fd9602]">
                              R$ {app.totalPrice.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <div className="flex gap-2">
                              {app.status === 'PENDENTE' && (
                                <>
                                  <button 
                                    onClick={() => updateAppointmentStatus(app.id, 'APROVADO')}
                                    className="px-3 py-1.5 rounded-xl bg-[#fd9602]/10 hover:bg-[#fd9602]/20 border border-[#fd9602]/20 text-[#fd9602] text-[10px] font-black uppercase tracking-wider"
                                  >
                                    Aprovar
                                  </button>
                                  <button 
                                    onClick={() => updateAppointmentStatus(app.id, 'CANCELADO')}
                                    className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider"
                                  >
                                    Recusar
                                  </button>
                                </>
                              )}
                              {app.status === 'APROVADO' && (
                                <>
                                  <button 
                                    onClick={() => updateAppointmentStatus(app.id, 'PAGO')}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider"
                                  >
                                    Marcar Pago
                                  </button>
                                  <button 
                                    onClick={() => updateAppointmentStatus(app.id, 'CANCELADO')}
                                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-wider"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                              {app.status === 'PAGO' && (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                  Concluído & Pago
                                </span>
                              )}
                              {app.status === 'CANCELADO' && (
                                <span className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                  Cancelado
                                </span>
                              )}
                            </div>

                            <button 
                              onClick={() => handleDeleteAppointment(app.id)}
                              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-zinc-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentTab === 'finance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white">Financeiro</h2>
                    <p className="text-zinc-500 text-sm">Monitore seu fluxo de caixa e saídas.</p>
                  </div>

                  {/* Billing Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl col-span-2">
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider block">Saldo Geral</span>
                      <span className="text-3xl font-black text-white mt-1 block">
                        R$ {stats.monthlyBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl">
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider block text-emerald-500 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Faturamento
                      </span>
                      <span className="text-base font-black text-zinc-100 mt-1 block">
                        R$ {stats.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl">
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider block text-red-500 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" /> Despesas
                      </span>
                      <span className="text-base font-black text-zinc-100 mt-1 block">
                        R$ {(stats.grossRevenue - stats.monthlyBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Responsive SVG Billing Bar Chart */}
                  <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Desempenho Anual (R$)</h3>
                    
                    <div className="h-28 flex items-end justify-between gap-1 pt-4">
                      {chartData.map((val, idx) => {
                        const heightPercent = val === 0 ? 0 : (val / chartMax) * 100
                        const monthsAbr = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-zinc-950 rounded-md h-24 flex items-end overflow-hidden">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(heightPercent, heightPercent > 0 ? 5 : 0)}%` }}
                                className="w-full bg-gradient-to-t from-amber-600 to-[#fd9602] rounded-md shadow-md shadow-[#fd9602]/10"
                              />
                            </div>
                            <span className="text-[9px] font-bold text-zinc-600">{monthsAbr[idx]}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Transactions list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white">Transações Recentes</h3>
                      <button 
                        onClick={() => setShowExpenseModal(true)}
                        className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Despesa
                      </button>
                    </div>

                    {transactions.length === 0 ? (
                      <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-2xl text-center">
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Nenhuma transação registrada</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transactions.map(t => (
                          <div 
                            key={t.id}
                            className="bg-zinc-900/40 border border-white/5 px-4 py-3.5 rounded-2xl flex items-center justify-between"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-zinc-200">{t.title}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t.category}</span>
                                <span className="text-[9px] font-bold text-zinc-600">{t.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {t.type === 'income' ? '+' : '-'} R$ {t.value.toFixed(2)}
                              </span>
                              <button 
                                onClick={() => handleDeleteTransaction(t.id, t.type)}
                                className="text-zinc-600 hover:text-red-500 p-1.5 rounded-lg bg-zinc-950 border border-white/5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentTab === 'customers' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">Clientes</h2>
                      <p className="text-zinc-500 text-sm">Lista de clientes atendidos.</p>
                    </div>
                    <button 
                      onClick={() => setShowCustomerModal(true)}
                      className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-950" /> Novo Cliente
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Pesquisar cliente por nome..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  </div>

                  {/* List */}
                  <div className="space-y-2">
                    {filteredCustomers.length === 0 ? (
                      <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-2xl text-center text-zinc-500 text-xs">
                        Nenhum cliente cadastrado
                      </div>
                    ) : (
                      filteredCustomers.map(c => (
                        <div 
                          key={c.id}
                          className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#fd9602]/10 border border-[#fd9602]/30 flex items-center justify-center text-xs font-black text-[#fd9602]">
                            {c.nome.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-200">{c.nome}</h4>
                            {c.email && (
                              <p className="text-zinc-500 text-xs">{c.email}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentTab === 'services' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">Serviços</h2>
                      <p className="text-zinc-500 text-sm">Cadastre e ajuste o valor dos serviços.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setServiceFormData({ id: '', nome: '', preco: '' })
                        setShowServiceModal(true)
                      }}
                      className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-950" /> Novo Serviço
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Pesquisar serviço..."
                      value={serviceSearch}
                      onChange={e => setServiceSearch(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  </div>

                  {/* List */}
                  <div className="space-y-2.5">
                    {filteredServices.length === 0 ? (
                      <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-2xl text-center text-zinc-500 text-xs">
                        Nenhum serviço cadastrado
                      </div>
                    ) : (
                      filteredServices.map(s => (
                        <div 
                          key={s.id}
                          className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center">
                              <Tag className="w-4 h-4 text-[#fd9602]" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-zinc-200">{s.nome}</h4>
                              <span className="text-xs font-extrabold text-[#fd9602]">R$ {s.preco.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => {
                                setServiceFormData({ id: s.id, nome: s.nome, preco: s.preco.toString() })
                                setShowServiceModal(true)
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-white/5 hover:bg-zinc-900 text-zinc-400 text-xs font-bold"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteService(s.id)}
                              className="p-1.5 rounded-xl bg-zinc-950 border border-white/5 hover:bg-zinc-900 text-zinc-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white">Configurações</h2>
                    <p className="text-zinc-500 text-sm">Informações de perfil e sistema.</p>
                  </div>

                  {/* Profile info */}
                  <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#fd9602]/10 border border-[#fd9602]/30 flex items-center justify-center text-base font-black text-[#fd9602]">
                      {userName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{userName}</h4>
                      <p className="text-zinc-500 text-xs">{email || user?.email}</p>
                    </div>
                  </div>

                  {/* Unavailability pauses manager */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Bloqueios Programados
                    </h3>

                    {pauses.length === 0 ? (
                      <div className="bg-zinc-900/20 border border-white/5 p-5 rounded-2xl text-center text-zinc-500 text-xs">
                        Nenhuma data indisponível programada
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pauses.map(p => (
                          <div 
                            key={p.id}
                            className="bg-zinc-900/40 border border-white/5 px-4 py-3 rounded-2xl flex items-center justify-between"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300">Motivo: {p.motivo}</h4>
                              <p className="text-zinc-500 text-[10px] mt-0.5">
                                Data: {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleDeletePause(p.id)}
                              className="px-2.5 py-1 text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl"
                            >
                              Desbloquear
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="w-full h-12 bg-red-500/10 hover:bg-red-500 border border-red-500/25 rounded-2xl text-red-500 hover:text-zinc-950 font-bold flex items-center justify-center gap-2 transition-all mt-8"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </main>

            {/* FLOATING TAB BAR (NUBANK STYLE) */}
            <nav className="fixed bottom-6 left-4 right-4 z-40 bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-around max-w-lg mx-auto">
              <button 
                onClick={() => setCurrentTab('home')}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all ${currentTab === 'home' ? 'text-[#fd9602] font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Scissors className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-bold">Painel</span>
                {currentTab === 'home' && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute -bottom-1.5 w-1 h-1 bg-[#fd9602] rounded-full" 
                  />
                )}
              </button>

              <button 
                onClick={() => setCurrentTab('agenda')}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all ${currentTab === 'agenda' ? 'text-[#fd9602] font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Calendar className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-bold">Agenda</span>
                {currentTab === 'agenda' && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute -bottom-1.5 w-1 h-1 bg-[#fd9602] rounded-full" 
                  />
                )}
              </button>

              <button 
                onClick={() => setCurrentTab('finance')}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all ${currentTab === 'finance' ? 'text-[#fd9602] font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <DollarSign className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-bold">Caixa</span>
                {currentTab === 'finance' && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute -bottom-1.5 w-1 h-1 bg-[#fd9602] rounded-full" 
                  />
                )}
              </button>

              <button 
                onClick={() => setCurrentTab('customers')}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all ${currentTab === 'customers' ? 'text-[#fd9602] font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-bold">Clientes</span>
                {currentTab === 'customers' && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute -bottom-1.5 w-1 h-1 bg-[#fd9602] rounded-full" 
                  />
                )}
              </button>

              <button 
                onClick={() => setCurrentTab('services')}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all ${currentTab === 'services' ? 'text-[#fd9602] font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Tag className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-bold">Serviços</span>
                {currentTab === 'services' && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute -bottom-1.5 w-1 h-1 bg-[#fd9602] rounded-full" 
                  />
                )}
              </button>

              <button 
                onClick={() => setCurrentTab('settings')}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all ${currentTab === 'settings' ? 'text-[#fd9602] font-bold scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-[9px] mt-1 font-bold">Ajustes</span>
                {currentTab === 'settings' && (
                  <motion.div 
                    layoutId="activeTabIndicator" 
                    className="absolute -bottom-1.5 w-1 h-1 bg-[#fd9602] rounded-full" 
                  />
                )}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== MODALS ===================== */}

      {/* APPOINTMENT (NOVO CORTE) MODAL */}
      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#fd9602]" /> Novo Agendamento
              </h3>
              <button 
                onClick={() => setShowAppModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Nome do Cliente</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do cliente completo"
                  value={appFormData.customerName}
                  onChange={e => setAppFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Horário</label>
                  <input 
                    type="time" 
                    required
                    value={appFormData.time}
                    onChange={e => setAppFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Data</label>
                  <input 
                    type="date" 
                    required
                    value={appFormData.date}
                    onChange={e => setAppFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Selecione os Serviços</label>
                {services.length === 0 ? (
                  <p className="text-zinc-600 text-xs font-bold">Cadastre serviços primeiro na aba Serviços.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {services.map(s => {
                      const isChecked = appFormData.selectedServiceIds.includes(s.id)
                      return (
                        <label 
                          key={s.id} 
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-colors cursor-pointer ${
                            isChecked 
                              ? 'bg-[#fd9602]/10 border-[#fd9602]/30 text-[#fd9602]' 
                              : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setAppFormData(prev => {
                                  const ids = prev.selectedServiceIds.includes(s.id)
                                    ? prev.selectedServiceIds.filter(id => id !== s.id)
                                    : [...prev.selectedServiceIds, s.id]
                                  return { ...prev, selectedServiceIds: ids }
                                })
                              }}
                              className="hidden"
                            />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-[#fd9602] border-[#fd9602]' : 'border-zinc-700'}`}>
                              {isChecked && <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold">{s.nome}</span>
                          </div>
                          <span className="text-xs font-black">R$ {s.preco.toFixed(2)}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm mt-6"
              >
                Cadastrar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-red-500" /> Registrar Saída (Despesa)
              </h3>
              <button 
                onClick={() => setShowExpenseModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Descrição</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Conta de Luz, Tinturas..."
                  value={expenseFormData.description}
                  onChange={e => setExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Valor (R$)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="0,00"
                    value={expenseFormData.value}
                    onChange={e => setExpenseFormData(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Categoria</label>
                  <select 
                    value={expenseFormData.category}
                    onChange={e => setExpenseFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-3 py-3 text-sm focus:outline-none focus:border-red-500 text-zinc-300"
                  >
                    <option value="Suprimentos">Suprimentos</option>
                    <option value="Serviços públicos">Aluguel/Contas</option>
                    <option value="Salários">Colaboradores</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Data de Vencimento/Pago</label>
                <input 
                  type="date" 
                  required
                  value={expenseFormData.date}
                  onChange={e => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full h-12 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold rounded-2xl flex items-center justify-center text-sm mt-6 shadow-lg shadow-red-500/10"
              >
                Lançar Despesa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PAUSE AGENDA MODAL */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Pausar Agenda
              </h3>
              <button 
                onClick={() => setShowPauseModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePause} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Motivo do Bloqueio</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Feriado municipal, Viagem, Reparo no salão..."
                  value={pauseFormData.reason}
                  onChange={e => setPauseFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Data do Bloqueio</label>
                <input 
                  type="date" 
                  required
                  value={pauseFormData.date}
                  onChange={e => setPauseFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-zinc-950 font-bold rounded-2xl flex items-center justify-center text-sm mt-6 shadow-lg shadow-blue-500/10"
              >
                Bloquear Horários
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#fd9602]" /> 
                {serviceFormData.id ? 'Ajustar Serviço' : 'Novo Serviço'}
              </h3>
              <button 
                onClick={() => setShowServiceModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Nome do Serviço</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Corte Degradê, Barboterapia..."
                  value={serviceFormData.nome}
                  onChange={e => setServiceFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Valor Unitário (R$)</label>
                <input 
                  type="text" 
                  required
                  placeholder="0,00"
                  value={serviceFormData.preco}
                  onChange={e => setServiceFormData(prev => ({ ...prev, preco: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                />
              </div>

              <button 
                type="submit" 
                className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm mt-6"
              >
                Salvar Serviço
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#fd9602]" /> Novo Cliente
              </h3>
              <button 
                onClick={() => setShowCustomerModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">Nome do Cliente</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do cliente completo"
                  value={customerFormData.nome}
                  onChange={e => setCustomerFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-bold mb-1.5">E-mail (Opcional)</label>
                <input 
                  type="email" 
                  placeholder="cliente@email.com"
                  value={customerFormData.email}
                  onChange={e => setCustomerFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                />
              </div>

              <button 
                type="submit" 
                className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm mt-6"
              >
                Cadastrar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
