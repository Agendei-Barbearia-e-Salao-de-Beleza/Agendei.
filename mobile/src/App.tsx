import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from './lib/supabase'
import { 
  Scissors, Calendar, DollarSign, Clock, Users, 
  Plus, Loader2, ArrowUpRight, ArrowDownRight, Wallet, Trash2, 
  LogOut, Search, Eye, EyeOff, Check, X, Tag, User, 
  RefreshCw, Coffee, Ban, Moon, Sun, Camera, Briefcase, Image, 
  MapPin, Phone, CheckCircle2, Link, Key, ChevronLeft, ChevronRight, Target
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

// Unsplash Preset Avatars & Logos for beautiful manager choice
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', // Female Stylish
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', // Male Modern
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', // Female Smile
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', // Male Elegant
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', // Casual Female
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'  // Casual Male
]

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80', // Classic Barbershop
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80', // Modern Hair Salon
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80', // Spa & Beauty Parlor
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80', // Vintage Grooming Salon
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80', // Elegant Hair Styling Room
  'https://images.unsplash.com/photo-1605497746444-ac9da58d7bfc?w=600&auto=format&fit=crop&q=80'  // Luxury Shave Barber
]

const VALID_DDDS = [
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99
]

const formatBrazilianPhone = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`
  if (digits.length <= 10) return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`
  return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`
}

export default function App() {
  const [authState, setAuthState] = useState<'loading' | 'login' | 'main'>('loading')
  const [currentTab, setCurrentTab] = useState<'home' | 'agenda' | 'finance' | 'customers' | 'profile'>('home')
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const [globalLoading, setGlobalLoading] = useState(false)

  // System Theme Mode (Persisted in LocalStorage)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('agendei-theme')
    return (saved as 'light' | 'dark') || 'dark'
  })

  // Auth States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  // Goal (Meta) states
  const [monthlyGoal, setMonthlyGoal] = useState<number>(5000)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalInput, setGoalInput] = useState('5000')

  // Establishment Details
  const [establishmentLogo, setEstablishmentLogo] = useState<string | null>(null)
  const [managerAvatar, setManagerAvatar] = useState<string | null>(null)
  const [establishmentData, setEstablishmentData] = useState<any>({
    nome: '',
    telefone: '',
    endereco: '',
    instagram_url: '',
    facebook_url: '',
    whatsapp_url: '',
    tiktok_url: ''
  })

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

  // Remember Me state (Persisted in LocalStorage)
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('agendei-remember-me') === 'true'
  })

  // Set default credentials on mount if rememberMe is enabled
  useEffect(() => {
    if (rememberMe) {
      const savedEmail = localStorage.getItem('agendei-remember-email')
      const savedPass = localStorage.getItem('agendei-remember-password')
      if (savedEmail) setEmail(savedEmail)
      if (savedPass) setPassword(savedPass)
    }
  }, [])

  // Selected date for Agenda
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Local Image Adjustment States
  const [imageToAdjust, setImageToAdjust] = useState<string | null>(null)
  const [adjustType, setAdjustType] = useState<'avatar' | 'banner'>('avatar')
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Handle local image file picker selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageToAdjust(reader.result)
        setAdjustType(type)
        setZoom(1)
        setRotation(0)
      }
    }
    reader.readAsDataURL(file)
  }

  // Draw adjusted/rotated image on canvas and export as optimized base64 JPEG
  const handleSaveAdjustedImage = () => {
    if (!imageToAdjust) return
    setGlobalLoading(true)
    const img = new window.Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          toast.error('Erro ao inicializar editor.')
          setGlobalLoading(false)
          return
        }

        const targetSize = adjustType === 'avatar' ? 400 : 800
        canvas.width = targetSize
        canvas.height = adjustType === 'avatar' ? 400 : 400

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()

        // Translate to center to rotate/scale properly
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)

        // Calculate aspect ratios
        const scaleFactor = zoom
        const widthToDraw = canvas.width * scaleFactor
        const heightToDraw = (widthToDraw * img.height) / img.width

        ctx.drawImage(img, -widthToDraw / 2, -heightToDraw / 2, widthToDraw, heightToDraw)
        ctx.restore()

        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85)
        if (adjustType === 'avatar') {
          setManagerAvatar(croppedBase64)
        } else {
          setEstablishmentLogo(croppedBase64)
        }
        
        setImageToAdjust(null)
        setZoom(1)
        setRotation(0)
        toast.success('Foto ajustada com sucesso! Lembre-se de salvar o perfil para persistir no banco.')
      } catch (err: any) {
        toast.error('Erro ao processar imagem: ' + err.message)
      } finally {
        setGlobalLoading(false)
      }
    }
    img.onerror = () => {
      toast.error('Erro ao carregar arquivo de imagem.')
      setGlobalLoading(false)
    }
    img.src = imageToAdjust
  }

  // Modals States (iOS Sheet Style)
  const [showAppModal, setShowAppModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showServiceListModal, setShowServiceListModal] = useState(false) // services tab as submodal inside profile
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null)

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
  const [incomeFormData, setIncomeFormData] = useState({
    description: '',
    value: '',
    category: 'Outros',
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

  // Calculate if paused today
  const isPausedToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return pauses.some(p => p.data === todayStr)
  }, [pauses])

  // Check if any modal is active to trigger parent background scaling (iOS style)
  const anyModalActive = showAppModal || showExpenseModal || showIncomeModal || showPauseModal || showServiceModal || showCustomerModal || showServiceListModal || showForgotPassword || showDetailsModal

  // Sync theme to document element
  useEffect(() => {
    localStorage.setItem('agendei-theme', theme)
    if (theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
  }, [theme])

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
        // Save remember-me choices
        localStorage.setItem('agendei-remember-me', rememberMe ? 'true' : 'false')
        if (rememberMe) {
          localStorage.setItem('agendei-remember-email', email)
          localStorage.setItem('agendei-remember-password', password)
        } else {
          localStorage.removeItem('agendei-remember-email')
          localStorage.removeItem('agendei-remember-password')
        }

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

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail) return
    setGlobalLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: 'io.ionic.agendeimanager://reset-password'
      })
      if (error) throw error
      toast.success('E-mail de redefinição enviado! Verifique sua caixa de entrada.')
      setShowForgotPassword(false)
      setForgotEmail('')
    } catch (e: any) {
      toast.error('Erro ao enviar e-mail: ' + e.message)
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
      const { data: estData } = await supabase
        .from('estabelecimentos')
        .select('*')
        .eq('proprietario_id', userId)
        .single()

      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (estData) {
        setEstablishmentId(estData.id)
        setEstablishmentLogo(estData.logo_url || null)
        setEstablishmentData({
          nome: estData.nome || '',
          telefone: estData.telefone || '',
          endereco: estData.endereco || '',
          instagram_url: estData.instagram_url || '',
          facebook_url: estData.facebook_url || '',
          whatsapp_url: estData.whatsapp_url || '',
          tiktok_url: estData.tiktok_url || ''
        })

        // Fetch monthly goal from metas
        const { data: goalData } = await supabase
          .from('metas')
          .select('valor_meta')
          .eq('estabelecimento_id', estData.id)
          .single()
        if (goalData) {
          setMonthlyGoal(Number(goalData.valor_meta))
          setGoalInput(goalData.valor_meta.toString())
        }

        refreshAllData(estData.id)
      }

      if (userData) {
        setUserName(userData.nome || 'Gerente')
        setManagerAvatar(userData.avatar_url || null)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function handleSaveGoal() {
    if (!establishmentId) return
    setGlobalLoading(true)
    try {
      const value = parseFloat(goalInput)
      if (isNaN(value) || value < 0) {
        toast.error('Insira um valor de meta válido.')
        return
      }

      const { error } = await supabase
        .from('metas')
        .upsert({
          estabelecimento_id: establishmentId,
          valor_meta: value,
          atualizado_em: new Date().toISOString()
        }, { onConflict: 'estabelecimento_id' })

      if (error) throw error

      setMonthlyGoal(value)
      setShowGoalModal(false)
      toast.success('Meta atualizada com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao atualizar meta: ' + err.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  async function handleSaveProfile() {
    if (!user || !establishmentId) return
    setGlobalLoading(true)
    try {
      // Validate Telephone DDD
      const telDigits = establishmentData.telefone.replace(/\D/g, '')
      if (telDigits.length > 0) {
        if (telDigits.length < 10 || telDigits.length > 11) {
          toast.error('Telefone Comercial deve ter 10 ou 11 dígitos.')
          setGlobalLoading(false)
          return
        }
        const ddd = parseInt(telDigits.substring(0, 2), 10)
        if (!VALID_DDDS.includes(ddd)) {
          toast.error(`DDD (${ddd}) do Telefone Comercial é inválido.`)
          setGlobalLoading(false)
          return
        }
      }

      // Validate WhatsApp DDD
      const waDigits = establishmentData.whatsapp_url.replace(/\D/g, '')
      if (waDigits.length > 0) {
        if (waDigits.length < 10 || waDigits.length > 11) {
          toast.error('WhatsApp deve ter 10 ou 11 dígitos.')
          setGlobalLoading(false)
          return
        }
        const ddd = parseInt(waDigits.substring(0, 2), 10)
        if (!VALID_DDDS.includes(ddd)) {
          toast.error(`DDD (${ddd}) do WhatsApp é inválido.`)
          setGlobalLoading(false)
          return
        }
      }

      const { error: estError } = await supabase
        .from('estabelecimentos')
        .update({
          nome: establishmentData.nome,
          telefone: establishmentData.telefone,
          endereco: establishmentData.endereco,
          logo_url: establishmentLogo,
          instagram_url: establishmentData.instagram_url,
          facebook_url: establishmentData.facebook_url,
          whatsapp_url: establishmentData.whatsapp_url,
          tiktok_url: establishmentData.tiktok_url
        })
        .eq('id', establishmentId)

      if (estError) throw estError

      const { error: userError } = await supabase
        .from('usuarios')
        .update({
          nome: userName,
          avatar_url: managerAvatar
        })
        .eq('id', user.id)

      if (userError) throw userError

      toast.success('Perfil atualizado com sucesso!')
      fetchEstablishmentData(user.id)
    } catch (e: any) {
      toast.error('Erro ao salvar alterações: ' + e.message)
    } finally {
      setGlobalLoading(false)
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

    const { count: clientCount } = await supabase
      .from('clientes_estabelecimentos')
      .select('cliente_id', { count: 'exact', head: true })
      .eq('estabelecimento_id', estId)

    const { count: monthAppCount } = await supabase
      .from('agendamentos')
      .select('id', { count: 'exact', head: true })
      .eq('estabelecimento_id', estId)
      .gte('data_hora', startOfMonth.toISOString())

    const { data: incomeData } = await supabase
      .from('agendamentos')
      .select('pagamentos!inner(valor)')
      .eq('estabelecimento_id', estId)
      .eq('pagamentos.status', 'PAGO')
      .gte('pagamentos.pago_em', startOfMonth.toISOString())

    const appointmentIncome = incomeData?.reduce((acc: number, curr: any) => {
      const pays = Array.isArray(curr.pagamentos) ? curr.pagamentos : [curr.pagamentos]
      return acc + pays.reduce((pAcc: number, p: any) => pAcc + Number(p.valor), 0)
    }, 0) || 0

    const { data: extrasData } = await supabase
      .from('receitas_extras')
      .select('valor')
      .eq('estabelecimento_id', estId)
      .gte('data', startOfMonth.toISOString().split('T')[0])

    const extrasIncome = extrasData?.reduce((acc: number, curr: any) => acc + Number(curr.valor), 0) || 0
    const totalIncome = appointmentIncome + extrasIncome

    const { data: expenseData } = await supabase
      .from('despesas')
      .select('valor')
      .eq('estabelecimento_id', estId)
      .gte('data', startOfMonth.toISOString().split('T')[0])

    const totalExpense = expenseData?.reduce((acc: number, curr: any) => acc + Number(curr.valor), 0) || 0

    // Fetch and populate chartData (Annual Billing)
    const { data: chartDataResponse } = await supabase
      .from('agendamentos')
      .select('data_hora, pagamentos!inner(valor)')
      .eq('estabelecimento_id', estId)
      .eq('pagamentos.status', 'PAGO')

    if (chartDataResponse) {
      const monthlyValues = new Array(12).fill(0)
      chartDataResponse.forEach((item: any) => {
        const month = new Date(item.data_hora).getMonth()
        const pays = Array.isArray(item.pagamentos) ? item.pagamentos : [item.pagamentos]
        const val = pays.reduce((pAcc: number, p: any) => pAcc + Number(p.valor), 0)
        monthlyValues[month] += val
      })
      setChartData(monthlyValues)
    }

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
    const [incRes, expRes, extrasRes] = await Promise.all([
      supabase.from('agendamentos').select('id, preco_total, data_hora, status, usuarios!agendamentos_cliente_id_fkey(nome)').eq('estabelecimento_id', estId).order('data_hora', { ascending: false }).limit(10),
      supabase.from('despesas').select('id, valor, descricao, data, categoria').eq('estabelecimento_id', estId).order('data', { ascending: false }).limit(10),
      supabase.from('receitas_extras').select('id, valor, descricao, data, categoria').eq('estabelecimento_id', estId).order('data', { ascending: false }).limit(10)
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
      ...(extrasRes.data?.map((r: any) => ({
        id: r.id,
        title: r.descricao,
        category: r.categoria || 'Receita Extra',
        date: new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR'),
        rawDate: r.data,
        value: Number(r.valor),
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

    const { data: chartAgendamentos } = await supabase
      .from('agendamentos')
      .select('preco_total, data_hora')
      .eq('estabelecimento_id', estId)
      .eq('status', 'CONCLUIDO')

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

      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('nome', appFormData.customerName)
        .eq('perfil', 'CLIENTE')
        .limit(1)

      if (existingUser && existingUser.length > 0) {
        clientId = existingUser[0].id
      } else {
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

  // Uses RPC (SECURITY DEFINER function) to bypass RLS restrictions on agendamentos UPDATE
  async function updateAppointmentStatus(appId: string, newStatus: string) {
    if (!establishmentId) return
    setGlobalLoading(true)
    try {
      const { data, error } = await supabase.rpc('atualizar_status_agendamento', {
        p_agendamento_id: appId,
        p_novo_status: newStatus
      })

      if (error) throw error

      // Check if the RPC returned a logical error (e.g., no permission)
      if (data && data.error) {
        throw new Error(data.error)
      }

      const label = newStatus === 'PAGO' ? 'pago e concluído' : newStatus.toLowerCase()
      toast.success(`Agendamento marcado como ${label}!`)
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

      toast.success('Despesa registrada no financeiro!')
      setShowExpenseModal(false)
      setExpenseFormData({
        description: '',
        value: '',
        category: 'Suprimentos',
        date: new Date().toISOString().split('T')[0]
      })
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao lançar despesa: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Create Income (Receita Extra) Save
  async function handleCreateIncome(e: React.FormEvent) {
    e.preventDefault()
    if (!establishmentId || !incomeFormData.description || !incomeFormData.value) return

    setGlobalLoading(true)
    try {
      const { error } = await supabase
        .from('receitas_extras')
        .insert([{
          estabelecimento_id: establishmentId,
          descricao: incomeFormData.description,
          valor: parseFloat(incomeFormData.value.replace(',', '.')),
          categoria: incomeFormData.category,
          data: incomeFormData.date
        }])

      if (error) throw error

      toast.success('Entrada registrada no financeiro!')
      setShowIncomeModal(false)
      setIncomeFormData({
        description: '',
        value: '',
        category: 'Outros',
        date: new Date().toISOString().split('T')[0]
      })
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao lançar entrada: ' + e.message)
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

      toast.success('Bloqueio de agenda registrado!')
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

  // Service Save
  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault()
    if (!establishmentId || !serviceFormData.nome || !serviceFormData.preco) return

    setGlobalLoading(true)
    try {
      const precoNum = parseFloat(serviceFormData.preco.replace(',', '.'))
      if (serviceFormData.id) {
        const { error } = await supabase
          .from('servicos')
          .update({
            nome: serviceFormData.nome,
            preco: precoNum
          })
          .eq('id', serviceFormData.id)
        if (error) throw error
        toast.success('Serviço atualizado!')
      } else {
        const { error } = await supabase
          .from('servicos')
          .insert([{
            estabelecimento_id: establishmentId,
            nome: serviceFormData.nome,
            preco: precoNum,
            duracao_minutos: 30
          }])
        if (error) throw error
        toast.success('Novo serviço adicionado!')
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
      toast.error('Erro ao excluir: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Customer Save
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

      const { error: relError } = await supabase
        .from('clientes_estabelecimentos')
        .insert([{
          cliente_id: newUser.id,
          estabelecimento_id: establishmentId
        }])

      if (relError) throw relError

      toast.success('Cliente cadastrado!')
      setShowCustomerModal(false)
      setCustomerFormData({ nome: '', email: '' })
      refreshAllData(establishmentId)
    } catch (e: any) {
      toast.error('Erro ao cadastrar cliente: ' + e.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  // Filters for lists
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.nome.toLowerCase().includes(customerSearch.toLowerCase()))
  }, [customers, customerSearch])

  const filteredServices = useMemo(() => {
    return services.filter(s => s.nome.toLowerCase().includes(serviceSearch.toLowerCase()))
  }, [services, serviceSearch])

  const agendaAppointments = useMemo(() => {
    return allAppointments.filter(a => a.date === selectedDate)
  }, [allAppointments, selectedDate])

  // Generate 5 centered dates around the currently selectedDate for the Calendar Carousel widget
  const calendarDays = useMemo(() => {
    const days = []
    const center = new Date(selectedDate + 'T12:00:00')
    for (let i = -2; i <= 2; i++) {
      const d = new Date(center)
      d.setDate(center.getDate() + i)
      days.push(d)
    }
    return days
  }, [selectedDate])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-300">
      <Toaster position="bottom-center" theme={theme} richColors />

      {/* Global Loading Spinner */}
      {globalLoading && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#fd9602] animate-spin" />
            <span className="text-xs font-bold text-white tracking-wide">Processando...</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {authState === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-6 min-h-screen relative"
          >
            <div className="absolute top-[20%] left-[20%] w-[60%] h-[30%] bg-[#fd9602]/10 rounded-full blur-[100px]" />
            <div className="bg-[#fd9602] p-4 rounded-3xl shadow-[0_0_30px_rgba(253,150,2,0.3)] animate-pulse">
              <Scissors className="text-zinc-950 w-12 h-12" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-6 tracking-tighter">
              Agendei<span className="text-[#fd9602]">.</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-3">Carregando Sessão...</p>
          </motion.div>
        )}

        {/* LOGIN SCREEN: FIXED / NON-SCROLLABLE STANDALONE CASHPAY PREMIUM LAYOUT */}
        {authState === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-screen h-screen overflow-hidden flex flex-col justify-between p-6 bg-zinc-950 relative"
          >
            {/* Elegant Background Glows matching reference image */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-[#fd9602]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-[#fd9602]/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Brand Area */}
            <div className="flex flex-col items-center mt-6 relative z-10">
              <div className="bg-[#fd9602]/10 border border-[#fd9602]/25 p-4 rounded-[24px] shadow-[0_0_30px_rgba(253,150,2,0.15)] mb-4">
                <Scissors className="text-[#fd9602] w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
                Agendei<span className="text-[#fd9602]">.</span>
              </h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Grooming & Style Manager</p>
            </div>

            {/* Form Section - Solto na tela (No card container wrapper!) */}
            <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center relative z-10 px-2 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-black text-white tracking-tight">Acesse sua Conta</h2>
                <p className="text-zinc-400 text-xs mt-1 font-medium">Bem-vindo de volta! Entre com seus dados.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Input with left icon */}
                <div>
                  <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">E-mail Corporativo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="gerente@agendei.app"
                      className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#fd9602] text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input with left key icon & right eye */}
                <div>
                  <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Senha do Gerente</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl pl-11 pr-12 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#fd9602] text-sm transition-colors"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me and Forgot Password row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none font-semibold">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-[#fd9602] focus:ring-0 focus:ring-offset-0"
                    />
                    Lembrar de mim
                  </label>
                  
                  <button 
                    type="button" 
                    onClick={() => setShowForgotPassword(true)}
                    className="font-bold text-[#fd9602] hover:text-[#fd9602]/80 focus:outline-none"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  className="w-full bg-[#fd9602] hover:bg-[#fd9602]/90 text-zinc-950 font-black rounded-2xl py-3.5 flex items-center justify-center shadow-lg shadow-[#fd9602]/20 active:scale-95 transition-all text-sm mt-4"
                >
                  Entrar
                </button>
              </form>

              {/* Separator */}
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="h-[1px] flex-1 bg-white/5" />
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Ou continuar com</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>

              {/* Social logins - OFFICIAL BRAND LOGOS & TEXT */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  className="bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 active:scale-95 py-3 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-bold text-zinc-200 transition-all"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.45 7.5l3.87 3C6.24 7.65 8.94 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.96h3.9c2.28-2.1 3.55-5.18 3.55-8.69z" />
                    <path fill="#FBBC05" d="M5.32 14.5c-.24-.72-.37-1.49-.37-2.3c0-.81.13-1.58.37-2.3L1.45 6.9C.63 8.54.18 10.37.18 12.3c0 1.93.45 3.76 1.27 5.4l3.87-3.2z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.9-2.96c-1.08.72-2.45 1.16-4.06 1.16-3.06 0-5.76-2.61-6.68-5.46L1.45 16.1C3.37 19.95 7.35 22.6 12 23z" />
                  </svg>
                  Google
                </button>
                <button 
                  type="button" 
                  className="bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 active:scale-95 py-3 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-bold text-zinc-200 transition-all"
                >
                  <svg className="w-4 h-4 shrink-0 fill-white" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05 1.88-3.08 1.88-1.02 0-1.4-.61-2.58-.61-1.16 0-1.58.59-2.58.61-1.02.02-2.2-.98-3.19-1.92-2.02-1.95-3.56-5.5-3.56-8.83 0-5.28 3.44-8.08 6.82-8.08 1.07 0 2.08.4 2.74.81.65.41 1.58.91 2.37.91.75 0 1.53-.45 2.15-.83.82-.5 1.92-.99 3.09-.99 3.63 0 6.38 2.65 6.38 6.37 0 .76-.08 1.53-.25 2.29-.71 3.1-2.31 7.23-3.9 9.38zm-3.21-17.3c.96-1.16 1.6-2.77 1.42-4.38-1.39.06-3.07.93-4.07 2.09-.87 1.01-1.63 2.65-1.41 4.22 1.55.12 3.1-.77 4.06-1.93z" />
                  </svg>
                  Apple
                </button>
              </div>
            </div>

            {/* Bottom Footer Signup */}
            <div className="text-center text-xs text-zinc-500 font-medium mb-4 relative z-10">
              Não tem uma conta? <span className="text-[#fd9602] font-black hover:underline cursor-pointer">Cadastre-se</span>
            </div>
          </motion.div>
        )}

        {/* MAIN SHELL WITH iOS BACKGROUND PAGE SHEET SCALE DOWN */}
        {authState === 'main' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              scale: anyModalActive ? 0.95 : 1,
              y: anyModalActive ? 10 : 0,
              borderRadius: anyModalActive ? '32px' : '0px'
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="flex-1 flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden transition-colors duration-300"
          >
            {/* Header - Fixed and spaced below standard notification notch area */}
            <header className="px-6 pt-14 pb-4 flex items-center justify-between fixed top-0 left-0 right-0 z-30 border-b border-[var(--border)] bg-[var(--modal-bg-glass)] backdrop-blur-md transition-colors duration-300 max-w-lg mx-auto">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#fd9602] p-1.5 rounded-lg shadow-md shadow-[#fd9602]/20">
                  <Scissors className="text-zinc-950 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">Agendei<span className="text-[#fd9602]">.</span></h2>
                  <p className="text-[10px] text-[#fd9602] font-extrabold uppercase tracking-widest leading-none">Manager App</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {establishmentId ? (
                  <button 
                    onClick={() => refreshAllData(establishmentId)}
                    className="p-2 rounded-full border border-[var(--border)] bg-zinc-900/50 light:bg-zinc-100 hover:bg-zinc-900 light:hover:bg-zinc-200 text-[var(--foreground)] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-zinc-400" />
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-500 border border-white/5 rounded-full px-2 py-1 bg-zinc-900">Offline</span>
                )}
                
                {/* Manager avatar */}
                <div className="flex items-center gap-2" onClick={() => setCurrentTab('profile')}>
                  {managerAvatar ? (
                    <img 
                      src={managerAvatar} 
                      alt="Manager Avatar" 
                      className="w-8 h-8 rounded-full object-cover border border-[#fd9602]/30 active:scale-95 transition-transform cursor-pointer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#fd9602]/10 border border-[#fd9602]/30 flex items-center justify-center text-xs font-bold text-[#fd9602] cursor-pointer">
                      {userName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* TAB CONTAINER WITH SCROLL PADDING FOR THE FLOATING TABBAR */}
            <main className="flex-1 p-6 pt-28 pb-32 overflow-y-auto">
              
              {/* TAB 1: PAINEL */}
              {currentTab === 'home' && (
                <div className="space-y-6">
                  {/* Establishment Banner Photo */}
                  <div 
                    onClick={() => setCurrentTab('profile')}
                    className="relative h-48 rounded-3xl overflow-hidden border border-white/10 shadow-lg group cursor-pointer"
                  >
                    <img 
                      src={establishmentLogo || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80'} 
                      alt="Establishment Logo" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-transparent flex flex-col justify-end p-6">
                      <h1 className="text-2xl font-black !text-white leading-tight tracking-tight">
                        {establishmentData.nome || 'Carregando estabelecimento...'}
                      </h1>
                      <div className="flex items-center gap-4 mt-2">
                        {establishmentData.endereco && (
                          <p className="!text-white/90 text-xs flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#fd9602]" />
                            {establishmentData.endereco.length > 28 ? establishmentData.endereco.substring(0, 28) + '...' : establishmentData.endereco}
                          </p>
                        )}
                        {establishmentData.telefone && (
                          <p className="!text-white/90 text-xs flex items-center gap-1 font-medium">
                            <Phone className="w-3.5 h-3.5 text-[#fd9602]" />
                            {establishmentData.telefone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-2xl font-black text-[var(--foreground)]">Olá, {userName}!</h1>
                    <p className="text-zinc-500 text-sm font-medium">Veja como estão as atividades do seu negócio hoje.</p>
                  </div>

                  {/* Business Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-2xl relative overflow-hidden bg-zinc-900/40">
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-[#fd9602]/10 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-[#fd9602]" />
                      </div>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider block">Clientes</span>
                      <span className="text-xl font-black text-[var(--foreground)] mt-1 block">{stats.totalClients}</span>
                    </div>

                    <div className="glass-card p-4 rounded-2xl relative overflow-hidden bg-zinc-900/40">
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider block">Agendamentos</span>
                      <span className="text-xl font-black text-[var(--foreground)] mt-1 block">{stats.monthAppointments}</span>
                    </div>

                    <div className="glass-card p-4 rounded-2xl relative overflow-hidden col-span-2 bg-zinc-900/40">
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[#fd9602]/10 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-[#fd9602]" />
                      </div>
                      <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider block">Saldo do Mês</span>
                      <span className="text-2xl font-black text-[#fd9602] mt-1 block">
                        R$ {stats.monthlyBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <span>Meta: R$ {monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <button 
                          onClick={() => setShowGoalModal(true)} 
                          className="text-[#fd9602] hover:underline cursor-pointer"
                        >
                          Ajustar Meta
                        </button>
                      </div>
                      <div className="w-full bg-zinc-950/80 rounded-full h-1.5 mt-2 overflow-hidden border border-white/5 relative">
                        {(() => {
                          const pct = Math.max(0, Math.min((stats.monthlyBalance / (monthlyGoal || 1)) * 100, 100));
                          const barBg = pct <= 15 
                            ? 'bg-[#fd9602]' 
                            : pct < 80 
                              ? 'bg-gradient-to-r from-[#fd9602] to-emerald-500' 
                              : 'bg-emerald-500';
                          return (
                            <div 
                              className={`${barBg} h-full rounded-full transition-all duration-500`} 
                              style={{ width: `${pct}%` }}
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* QUICK ACTIONS WITH PAUSE SELECT ANIMATION */}
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => {
                        setAppFormData({ customerName: '', time: '10:00', date: new Date().toISOString().split('T')[0], selectedServiceIds: [] })
                        setShowAppModal(true)
                      }}
                      className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-900/90 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#fd9602]/10 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-[#fd9602]" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300 leading-tight">Novo Corte</span>
                    </button>

                    <button 
                      onClick={() => setShowExpenseModal(true)}
                      className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-900/90 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300 leading-tight">Registrar Saída</span>
                    </button>

                    <button 
                      onClick={() => setShowPauseModal(true)}
                      className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-900/90 transition-colors relative overflow-hidden"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isPausedToday ? 'paused' : 'active'}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col items-center justify-center gap-2"
                        >
                          <div className={`w-8 h-8 rounded-full ${isPausedToday ? 'bg-emerald-500/10' : 'bg-blue-500/10'} flex items-center justify-center`}>
                            {isPausedToday ? (
                              <Coffee className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Ban className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <span className={`text-[10px] font-bold ${isPausedToday ? 'text-emerald-400' : 'text-zinc-300'} leading-tight`}>
                            {isPausedToday ? 'Pausa Ativa' : 'Pausar Dia'}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                      {isPausedToday && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      )}
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

                    <div className="space-y-2.5">
                      {todayAppointments.length === 0 ? (
                        <div className="glass-card p-8 rounded-2xl text-center text-zinc-500 text-xs">
                          Nenhum agendamento para hoje
                        </div>
                      ) : (
                        todayAppointments.map(app => (
                          <div 
                            key={app.id} 
                            onClick={() => {
                              setSelectedApp(app)
                              setShowDetailsModal(true)
                            }}
                            className="glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-900/60 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex flex-col items-center justify-center font-bold text-[#fd9602] text-xs">
                                <span className="text-[10px] text-zinc-500 font-extrabold uppercase leading-none">Hora</span>
                                <span className="text-xs font-black mt-0.5">{app.time}</span>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-zinc-200">{app.customer}</h4>
                                <p className="text-zinc-500 text-[10px] mt-0.5 font-semibold">
                                  {app.services.map(s => s.nome).join(', ')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {app.status === 'PENDENTE' && (
                                <span className="bg-[#fd9602]/10 border border-[#fd9602]/20 px-2.5 py-1 rounded-xl text-[9px] font-black text-[#fd9602] uppercase tracking-wider">
                                  Pendente
                                </span>
                              )}
                              {app.status === 'APROVADO' && (
                                <span className="bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-wider">
                                  Aprovado
                                </span>
                              )}
                              {app.status === 'CONCLUIDO' && (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                                  Pago
                                </span>
                              )}
                              {app.status === 'CANCELADO' && (
                                <span className="bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-xl text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                                  Cancelado
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AGENDA */}
              {currentTab === 'agenda' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">Agenda</h2>
                      <p className="text-zinc-500 text-sm">Visualize e filtre por data.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setAppFormData({ customerName: '', time: '10:00', date: selectedDate, selectedServiceIds: [] })
                        setShowAppModal(true)
                      }}
                      className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-950" /> Agendar
                    </button>
                  </div>

                  {/* PREMIUM CALENDAR DATE CARD CAROUSEL WITH NAVIGATION ARROWS */}
                  <div className="flex items-center justify-between gap-2.5">
                    <button 
                      onClick={() => {
                        const d = new Date(selectedDate + 'T12:00:00')
                        d.setDate(d.getDate() - 1)
                        setSelectedDate(d.toISOString().split('T')[0])
                      }}
                      className="p-3 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 active:scale-95 transition-all text-zinc-400"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#fd9602]" />
                    </button>

                    <div className="flex-1 grid grid-cols-5 gap-2 relative z-0">
                      {calendarDays.map((day) => {
                        const dateStr = day.toISOString().split('T')[0]
                        const isSelected = dateStr === selectedDate
                        const dayNum = day.getDate()
                        const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
                        const dayName = daysOfWeek[day.getDay()]

                        return (
                          <motion.button
                            key={dateStr}
                            layout
                            type="button"
                            onClick={() => setSelectedDate(dateStr)}
                            className={`relative flex flex-col items-center justify-center py-3.5 rounded-2xl border transition-colors duration-300 ${
                              isSelected 
                                ? 'border-transparent text-zinc-950 font-black' 
                                : 'bg-zinc-900/30 border-white/5 text-zinc-400 hover:text-zinc-200'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {/* Liquid sliding active background highlight */}
                            {isSelected && (
                              <motion.div 
                                layoutId="activeDateBg"
                                className="absolute inset-0 bg-[#fd9602] rounded-2xl shadow-lg shadow-[#fd9602]/25"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                              />
                            )}

                            <span className={`text-[8px] font-black uppercase tracking-wider relative z-10 ${isSelected ? 'text-zinc-950/70' : 'text-zinc-500'}`}>
                              {dayName}
                            </span>
                            <span className="text-sm font-black mt-1 relative z-10">{dayNum}</span>
                          </motion.button>
                        )
                      })}
                    </div>

                    <button 
                      onClick={() => {
                        const d = new Date(selectedDate + 'T12:00:00')
                        d.setDate(d.getDate() + 1)
                        setSelectedDate(d.toISOString().split('T')[0])
                      }}
                      className="p-3 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 active:scale-95 transition-all text-zinc-400"
                    >
                      <ChevronRight className="w-4 h-4 text-[#fd9602]" />
                    </button>
                  </div>

                  {/* Elegant micro Calendar Jump option */}
                  <div className="flex items-center justify-end">
                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold hover:text-[#fd9602] flex items-center gap-1.5 cursor-pointer transition-colors bg-white dark:bg-zinc-900/20 px-3 py-1.5 rounded-full border border-[var(--border)] shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <Calendar className="w-3.5 h-3.5 text-[#fd9602]" />
                      Ir para data específica
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="opacity-0 w-0 h-0 p-0 absolute pointer-events-none"
                      />
                    </label>
                  </div>

                  {/* Appointments lists */}
                  <div className="space-y-3">
                    {agendaAppointments.length === 0 ? (
                      <div className="glass-card p-12 rounded-2xl text-center text-zinc-500 text-xs">
                        Nenhum agendamento cadastrado para esta data.
                      </div>
                    ) : (
                      agendaAppointments.map(app => (
                        <div 
                          key={app.id}
                          onClick={() => {
                            setSelectedApp(app)
                            setShowDetailsModal(true)
                          }}
                          className="glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-900/60 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/5 flex flex-col items-center justify-center font-bold text-[#fd9602]">
                              <span className="text-[9px] text-zinc-500 font-black leading-none uppercase">Hora</span>
                              <span className="text-sm font-black mt-0.5">{app.time}</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-zinc-200">{app.customer}</h4>
                              <p className="text-zinc-500 text-[10px] mt-0.5">
                                {app.services.map(s => s.nome).join(', ')}
                              </p>
                              <span className="text-xs font-black text-[#fd9602] mt-1 block">R$ {app.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {app.status === 'PENDENTE' && (
                              <span className="bg-[#fd9602]/10 border border-[#fd9602]/20 px-2.5 py-1 rounded-xl text-[9px] font-black text-[#fd9602] uppercase tracking-wider">
                                Pendente
                              </span>
                            )}
                            {app.status === 'APROVADO' && (
                              <span className="bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-wider">
                                Aprovado
                              </span>
                            )}
                            {app.status === 'CONCLUIDO' && (
                              <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                                Pago
                              </span>
                            )}
                            {app.status === 'CANCELADO' && (
                              <span className="bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-xl text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                                Cancelado
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CAIXA / FINANCEIRO */}
              {currentTab === 'finance' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">Fluxo de Caixa</h2>
                      <p className="text-zinc-500 text-sm">Entradas e saídas recentes.</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowIncomeModal(true)}
                        className="h-10 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold px-3 rounded-xl flex items-center justify-center text-xs gap-1 hover:bg-emerald-500 hover:text-zinc-950 transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> Entrada
                      </button>
                      <button 
                        onClick={() => setShowExpenseModal(true)}
                        className="h-10 bg-red-500/15 border border-red-500/25 text-red-500 font-bold px-3 rounded-xl flex items-center justify-center text-xs gap-1 hover:bg-red-500 hover:text-zinc-950 transition-colors"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" /> Saída
                      </button>
                    </div>
                  </div>

                  {/* Balanced Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-2xl bg-zinc-900/40 relative overflow-hidden">
                      <ArrowUpRight className="w-5 h-5 text-emerald-500 absolute top-3 right-3" />
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Faturamento</span>
                      <p className="text-lg font-black text-white mt-1">R$ {stats.grossRevenue.toFixed(2)}</p>
                    </div>

                    <div className="glass-card p-4 rounded-2xl bg-zinc-900/40 relative overflow-hidden">
                      <ArrowDownRight className="w-5 h-5 text-red-500 absolute top-3 right-3" />
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Despesas</span>
                      <p className="text-lg font-black text-white mt-1">
                        R$ {transactions.filter(t => t.type === 'expense').reduce((a,c)=>a+c.value, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Monthly Performance Chart utilizing chartData */}
                  <div className="glass-card p-5 rounded-3xl bg-zinc-900/40 space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#fd9602]" /> Desempenho Faturamento Anual
                    </h3>
                    <div className="h-28 flex items-end gap-2 pt-2">
                      {chartData.map((val, idx) => {
                        const maxVal = Math.max(...chartData, 1)
                        const pct = (val / maxVal) * 100
                        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            <div className="w-full bg-[#fd9602]/10 border border-[#fd9602]/20 rounded-t-lg relative overflow-hidden group-hover:bg-[#fd9602]/20 transition-all" style={{ height: `${Math.max(pct, 5)}%` }}>
                              <div className="absolute inset-0 bg-gradient-to-t from-[#fd9602] to-transparent opacity-80" />
                            </div>
                            <span className="text-[8px] font-extrabold text-zinc-500 group-hover:text-white transition-colors">{monthNames[idx]}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Transactions Lists */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-[#fd9602]" /> Extrato do Caixa
                    </h3>

                    {transactions.length === 0 ? (
                      <div className="glass-card p-12 rounded-2xl text-center text-zinc-500 text-xs">
                        Nenhuma movimentação registrada no caixa.
                      </div>
                    ) : (
                      transactions.map(t => (
                        <div 
                          key={t.id}
                          className="glass-card p-4 rounded-2xl flex items-center justify-between bg-zinc-900/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} flex items-center justify-center`}>
                              {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-zinc-200">{t.title}</h4>
                              <p className="text-zinc-500 text-[10px] mt-0.5">{t.date} • {t.category}</p>
                            </div>
                          </div>

                          <span className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.type === 'income' ? '+' : '-'} R$ {t.value.toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CLIENTES */}
              {currentTab === 'customers' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">Clientes</h2>
                      <p className="text-zinc-500 text-sm">Base de dados cadastrada.</p>
                    </div>
                    <button 
                      onClick={() => setShowCustomerModal(true)}
                      className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-950" /> Novo
                    </button>
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Pesquisar cliente..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="w-full bg-zinc-900/60 light:bg-white border border-[var(--border)] text-[var(--foreground)] rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#fd9602] shadow-sm"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  </div>

                  {/* List of customers */}
                  <div className="space-y-2.5">
                    {filteredCustomers.length === 0 ? (
                      <div className="glass-card p-12 rounded-2xl text-center text-zinc-500 text-xs">
                        Nenhum cliente cadastrado
                      </div>
                    ) : (
                      filteredCustomers.map(c => (
                        <div 
                          key={c.id}
                          className="glass-card p-4 rounded-2xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center font-bold text-zinc-500 uppercase text-sm">
                              {c.nome.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-zinc-200">{c.nome}</h4>
                              <p className="text-zinc-500 text-[10px] mt-0.5">{c.email || 'Sem e-mail cadastrado'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => {
                                setAppFormData({ customerName: c.nome, time: '10:00', date: new Date().toISOString().split('T')[0], selectedServiceIds: [] })
                                setShowAppModal(true)
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-white/5 hover:bg-zinc-900 text-zinc-400 text-xs font-bold"
                            >
                              Agendar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: PERFIL (MERGES CUSTOM SETTINGS & ENTIRE DATABASE CONFIGS) */}
              {currentTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-white">Perfil do Estabelecimento</h2>
                    <p className="text-zinc-500 text-sm">Gerencie dados do perfil e preferências do sistema.</p>
                  </div>

                  {/* Curved Glass Profile Form Card */}
                  <div className="glass-card p-6 rounded-3xl space-y-5 bg-zinc-900/40 relative">
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                      <User className="w-4 h-4 text-[#fd9602]" /> Detalhes do Gerente
                    </h3>

                    {/* Preset Avatars Selector */}
                    <div>
                      <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Foto do Gerente (Avatar)</label>
                      <div className="flex items-center gap-4 mb-3">
                        {managerAvatar ? (
                          <img src={managerAvatar} alt="Avatar Preview" className="w-14 h-14 rounded-full object-cover border-2 border-[#fd9602]" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-[#fd9602]/10 border-2 border-dashed border-[#fd9602]/30 flex items-center justify-center text-[#fd9602]">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col gap-2">
                          <input 
                            type="text" 
                            placeholder="Link da imagem..."
                            value={managerAvatar || ''}
                            onChange={e => setManagerAvatar(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#fd9602]"
                          />
                          <label className="bg-zinc-900 light:bg-white hover:bg-zinc-800 light:hover:bg-zinc-100 border border-[var(--border)] rounded-2xl py-2 px-4 text-center text-xs font-black text-[var(--foreground)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all shadow-sm">
                            <Camera className="w-4 h-4 text-[#fd9602]" /> Importar e Ajustar Foto
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => handleImageSelect(e, 'avatar')}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {PRESET_AVATARS.map((url, i) => (
                          <button 
                            key={i} 
                            type="button"
                            onClick={() => setManagerAvatar(url)}
                            className={`rounded-full overflow-hidden h-9 w-9 border-2 ${managerAvatar === url ? 'border-[#fd9602] scale-105' : 'border-transparent'}`}
                          >
                            <img src={url} alt={`Avatar Preset ${i}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Nome do Gerente</label>
                      <input 
                        type="text" 
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                      />
                    </div>
                  </div>

                  {/* Establishment settings */}
                  <div className="glass-card p-6 rounded-3xl space-y-5 bg-zinc-900/40">
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                      <Briefcase className="w-4 h-4 text-blue-500" /> Detalhes do Negócio
                    </h3>

                    {/* Preset Banner Selector */}
                    <div>
                      <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-2">Foto de Capa do Salão</label>
                      <div className="flex items-center gap-4 mb-3">
                        {establishmentLogo ? (
                          <img src={establishmentLogo} alt="Logo Preview" className="w-14 h-10 rounded-xl object-cover border border-white/10" />
                        ) : (
                          <div className="w-14 h-10 rounded-xl bg-zinc-950 border border-dashed border-white/10 flex items-center justify-center text-zinc-600">
                            <Image className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col gap-2">
                          <input 
                            type="text" 
                            placeholder="Link do banner..."
                            value={establishmentLogo || ''}
                            onChange={e => setEstablishmentLogo(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                          <label className="bg-zinc-900 light:bg-white hover:bg-zinc-800 light:hover:bg-zinc-100 border border-[var(--border)] rounded-2xl py-2 px-4 text-center text-xs font-black text-[var(--foreground)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all shadow-sm">
                            <Image className="w-4 h-4 text-blue-500" /> Importar e Ajustar Banner
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => handleImageSelect(e, 'banner')}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {PRESET_LOGOS.map((url, i) => (
                          <button 
                            key={i} 
                            type="button"
                            onClick={() => setEstablishmentLogo(url)}
                            className={`rounded-xl overflow-hidden h-9 w-full border-2 ${establishmentLogo === url ? 'border-blue-500 scale-105' : 'border-transparent'}`}
                          >
                            <img src={url} alt={`Logo Preset ${i}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Nome Comercial</label>
                        <input 
                          type="text" 
                          value={establishmentData.nome}
                          onChange={e => setEstablishmentData((prev: any) => ({ ...prev, nome: e.target.value }))}
                          className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Telefone Comercial</label>
                        <input 
                          type="text" 
                          placeholder="(11) 99999-9999"
                          value={establishmentData.telefone}
                          onChange={e => {
                            const masked = formatBrazilianPhone(e.target.value)
                            setEstablishmentData((prev: any) => ({ ...prev, telefone: masked }))
                          }}
                          className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">WhatsApp Comercial</label>
                        <input 
                          type="text" 
                          placeholder="(11) 99999-9999"
                          value={establishmentData.whatsapp_url}
                          onChange={e => {
                            const masked = formatBrazilianPhone(e.target.value)
                            setEstablishmentData((prev: any) => ({ ...prev, whatsapp_url: masked }))
                          }}
                          className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                        />
                      </div>

                      <div className="col-span-2 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">CEP (Auto-completar)</label>
                          <input 
                            type="text" 
                            maxLength={9}
                            placeholder="00000-000"
                            onChange={async (e) => {
                              const val = e.target.value.replace(/\D/g, '')
                              if (val.length === 8) {
                                try {
                                  const res = await fetch(`https://viacep.com.br/ws/${val}/json/`)
                                  const data = await res.json()
                                  if (!data.erro) {
                                    const fullAddr = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
                                    setEstablishmentData((prev: any) => ({ ...prev, endereco: fullAddr }))
                                    toast.success('Endereço auto-completado!')
                                  } else {
                                    toast.error('CEP não encontrado.')
                                  }
                                } catch (err) {
                                  toast.error('Erro ao buscar CEP.')
                                }
                              }
                            }}
                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Endereço Comercial</label>
                          <input 
                            type="text" 
                            value={establishmentData.endereco}
                            onChange={e => setEstablishmentData((prev: any) => ({ ...prev, endereco: e.target.value }))}
                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social media connections */}
                  <div className="glass-card p-6 rounded-3xl space-y-4 bg-zinc-900/40">
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                      <Link className="w-4 h-4 text-purple-500" /> Redes Sociais
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Link Instagram</label>
                        <input 
                          type="text" 
                          placeholder="instagram.com/seu.salao"
                          value={establishmentData.instagram_url}
                          onChange={e => setEstablishmentData((prev: any) => ({ ...prev, instagram_url: e.target.value }))}
                          className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Link Facebook</label>
                        <input 
                          type="text" 
                          placeholder="facebook.com/seu.salao"
                          value={establishmentData.facebook_url}
                          onChange={e => setEstablishmentData((prev: any) => ({ ...prev, facebook_url: e.target.value }))}
                          className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Link TikTok</label>
                        <input 
                          type="text" 
                          placeholder="tiktok.com/@seu.salao"
                          value={establishmentData.tiktok_url}
                          onChange={e => setEstablishmentData((prev: any) => ({ ...prev, tiktok_url: e.target.value }))}
                          className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="flex items-end">
                        <button 
                          onClick={handleSaveProfile}
                          className="w-full btn-primary h-[34px] text-xs font-black flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" /> Salvar Perfil
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tab Sub-modal trigger: Gerenciar Serviços */}
                  <button 
                    onClick={() => setShowServiceListModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-3xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/80 transition-all text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-zinc-200">Catálogo de Serviços</h4>
                        <p className="text-zinc-500 text-[10px] mt-0.5">Cadastre, edite e mude valores dos cortes</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-[#fd9602]" />
                  </button>

                  {/* Scheduled pauses (old settings) */}
                  <div className="glass-card p-6 rounded-3xl space-y-4 bg-zinc-900/40">
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-500" /> Bloqueios de Agenda
                    </h3>

                    {pauses.length === 0 ? (
                      <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-2xl text-center text-zinc-500 text-xs font-semibold">
                        Nenhum bloqueio programado
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pauses.map(p => (
                          <div 
                            key={p.id}
                            className="bg-zinc-950 border border-white/5 px-4 py-3 rounded-2xl flex items-center justify-between"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300">Motivo: {p.motivo}</h4>
                              <p className="text-zinc-500 text-[9px] mt-0.5">
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

                  {/* Curated Segmented Theme Switcher (Claro / Escuro) */}
                  <div className="glass-card p-4 rounded-3xl flex items-center justify-between bg-zinc-900/40">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Aparência do Sistema</span>
                    <div className="bg-zinc-950 p-1 rounded-2xl flex items-center border border-white/5 gap-1 relative w-36 h-10">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-xl text-xs font-black relative z-10 transition-colors ${theme === 'light' ? 'text-zinc-950' : 'text-zinc-500'}`}
                      >
                        <Sun className="w-3.5 h-3.5" /> Claro
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-xl text-xs font-black relative z-10 transition-colors ${theme === 'dark' ? 'text-[#fd9602]' : 'text-zinc-500'}`}
                      >
                        <Moon className="w-3.5 h-3.5" /> Escuro
                      </button>

                      <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ${theme === 'light' ? 'left-1 bg-[#fd9602]' : 'left-[calc(50%+2px)] bg-zinc-900 border border-white/10'}`} />
                    </div>
                  </div>

                  {/* Log out */}
                  <button 
                    onClick={handleLogout}
                    className="w-full h-12 bg-red-500/10 hover:bg-red-500 border border-red-500/25 rounded-3xl text-red-500 hover:text-zinc-950 font-bold flex items-center justify-center gap-2 transition-all mt-4"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </main>

            {/* REDESIGNED FLOATING PILL TAB BAR (EXACTLY 5 ICON-ONLY BUTTONS) */}
            <nav className="fixed bottom-6 left-4 right-4 z-40 glass-card px-4 py-3.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex items-center justify-around max-w-lg mx-auto transition-all duration-300">
              <button 
                onClick={() => setCurrentTab('home')}
                className={`relative flex items-center justify-center p-2.5 rounded-full transition-all ${currentTab === 'home' ? 'text-[#fd9602] font-black scale-110' : 'text-zinc-500 hover:text-zinc-300 active:scale-95'}`}
              >
                <Scissors className="w-6 h-6" />
              </button>

              <button 
                onClick={() => setCurrentTab('agenda')}
                className={`relative flex items-center justify-center p-2.5 rounded-full transition-all ${currentTab === 'agenda' ? 'text-[#fd9602] font-black scale-110' : 'text-zinc-500 hover:text-zinc-300 active:scale-95'}`}
              >
                <Calendar className="w-6 h-6" />
              </button>

              <button 
                onClick={() => setCurrentTab('finance')}
                className={`relative flex items-center justify-center p-2.5 rounded-full transition-all ${currentTab === 'finance' ? 'text-[#fd9602] font-black scale-110' : 'text-zinc-500 hover:text-zinc-300 active:scale-95'}`}
              >
                <DollarSign className="w-6 h-6" />
              </button>

              <button 
                onClick={() => setCurrentTab('customers')}
                className={`relative flex items-center justify-center p-2.5 rounded-full transition-all ${currentTab === 'customers' ? 'text-[#fd9602] font-black scale-110' : 'text-zinc-500 hover:text-zinc-300 active:scale-95'}`}
              >
                <Users className="w-6 h-6" />
              </button>

              <button 
                onClick={() => setCurrentTab('profile')}
                className={`relative flex items-center justify-center p-2.5 rounded-full transition-all ${currentTab === 'profile' ? 'text-[#fd9602] font-black scale-110' : 'text-zinc-500 hover:text-zinc-300 active:scale-95'}`}
              >
                <User className="w-6 h-6" />
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== MODALS (iOS SPRING PHYSICS SHEETS) ===================== */}
      <AnimatePresence>
        
        {/* FORGOT PASSWORD MODAL */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setShowForgotPassword(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10 max-h-[80vh] overflow-y-auto"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={() => setShowForgotPassword(false)} />
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#fd9602]" /> Esqueci minha senha
                </h3>
                <button 
                  onClick={() => setShowForgotPassword(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Digite seu e-mail cadastrado abaixo. Enviaremos um link seguro para você redefinir sua senha de gerente.
                </p>
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">E-mail Cadastrado</label>
                  <input 
                    type="email" 
                    required 
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="gerente@agendei.app"
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm mt-6"
                >
                  Enviar E-mail de Recuperação
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* DETAILS MODAL (TODAY'S OR SELECTED DAY APPOINTMENT DETAILS) */}
        {showDetailsModal && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowDetailsModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={() => setShowDetailsModal(false)} />
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#fd9602]" /> Detalhes do Horário
                </h3>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Client detail card */}
                <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Cliente</span>
                  <span className="text-base font-black text-white block">{selectedApp.customer}</span>
                  <span className="text-xs text-zinc-400 font-medium block">Data: {new Date(selectedApp.date + 'T00:00:00').toLocaleDateString('pt-BR')} • {selectedApp.time}</span>
                </div>

                {/* Services list detail */}
                <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl space-y-3">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Serviços Contratados</span>
                  {selectedApp.services.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold text-zinc-300 border-b border-white/5 last:border-b-0 pb-2 last:pb-0">
                      <span>{s.nome}</span>
                      <span className="text-[#fd9602]">R$ {s.preco.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center border-t border-white/10 pt-2 font-black text-sm text-white">
                    <span>Valor Total</span>
                    <span className="text-[#fd9602]">R$ {selectedApp.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-3.5 pt-4">
                  {selectedApp.status === 'PENDENTE' && (
                    <>
                      <button 
                        onClick={() => {
                          updateAppointmentStatus(selectedApp.id, 'APROVADO')
                          setShowDetailsModal(false)
                        }}
                        className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-1.5 text-xs uppercase"
                      >
                        <Check className="w-4 h-4 text-zinc-950" /> Aprovar
                      </button>
                      <button 
                        onClick={() => {
                          updateAppointmentStatus(selectedApp.id, 'CANCELADO')
                          setShowDetailsModal(false)
                        }}
                        className="flex-1 h-12 bg-zinc-800 hover:bg-zinc-700 text-red-500 font-black rounded-2xl border border-white/5 flex items-center justify-center gap-1.5 text-xs uppercase"
                      >
                        <X className="w-4 h-4 text-red-500" /> Cancelar
                      </button>
                    </>
                  )}

                  {selectedApp.status === 'APROVADO' && (
                    <>
                      {/* REAL PAID ACTION TRIGGER */}
                      <button 
                        onClick={() => {
                          updateAppointmentStatus(selectedApp.id, 'PAGO')
                          setShowDetailsModal(false)
                        }}
                        className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-1.5 text-xs uppercase shadow-lg shadow-emerald-500/10"
                      >
                        <Check className="w-4 h-4 text-zinc-950" /> Marcar como Pago
                      </button>
                      <button 
                        onClick={() => {
                          updateAppointmentStatus(selectedApp.id, 'CANCELADO')
                          setShowDetailsModal(false)
                        }}
                        className="h-12 w-12 bg-zinc-850 hover:bg-zinc-800 text-red-500 border border-white/5 rounded-2xl flex items-center justify-center"
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    </>
                  )}

                  {(selectedApp.status === 'CONCLUIDO' || selectedApp.status === 'CANCELADO') && (
                    <div className="w-full text-center py-2 bg-zinc-950 border border-white/5 rounded-2xl font-black text-xs uppercase tracking-wider text-zinc-500">
                      Horário Finalizado ({selectedApp.status === 'CONCLUIDO' ? 'Pago' : 'Cancelado'})
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      handleDeleteAppointment(selectedApp.id)
                      setShowDetailsModal(false)
                    }}
                    className="p-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center shrink-0"
                    title="Excluir Agendamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* APPOINTMENT (NOVO CORTE) MODAL */}
        {showAppModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowAppModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={() => setShowAppModal(false)} />
              
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
                  <label className="block text-zinc-400 text-xs font-bold mb-2">Selecione os Serviços</label>
                  {services.length === 0 ? (
                    <p className="text-[10px] text-zinc-600">Nenhum serviço cadastrado.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                      {services.map(s => {
                        const isSelected = appFormData.selectedServiceIds.includes(s.id)
                        return (
                          <button
                            type="button"
                            key={s.id}
                            onClick={() => {
                              if (isSelected) {
                                setAppFormData(prev => ({ ...prev, selectedServiceIds: prev.selectedServiceIds.filter(id => id !== s.id) }))
                              } else {
                                setAppFormData(prev => ({ ...prev, selectedServiceIds: [...prev.selectedServiceIds, s.id] }))
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${isSelected ? 'bg-[#fd9602]/10 border-[#fd9602] text-[#fd9602]' : 'bg-zinc-950 border-white/5 text-zinc-400'}`}
                          >
                            <span className="text-xs font-black truncate">{s.nome}</span>
                            <span className="text-[10px] font-black shrink-0">R${s.preco}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm mt-6 shadow-lg shadow-[#fd9602]/10"
                >
                  Registrar Horário
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* EXPENSE (REGISTRAR SAÍDA) MODAL */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowExpenseModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={() => setShowExpenseModal(false)} />
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-500" /> Registrar Saída Financeira
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
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Descrição da Saída</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Aluguel, Compra de Shampoos, Conta de Luz..."
                    value={expenseFormData.description}
                    onChange={e => setExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-1.5">Valor Unitário (R$)</label>
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
                    <label className="block text-zinc-400 text-xs font-bold mb-1.5">Data</label>
                    <input 
                      type="date" 
                      required
                      value={expenseFormData.date}
                      onChange={e => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Categoria</label>
                  <select 
                    value={expenseFormData.category}
                    onChange={e => setExpenseFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 text-zinc-400"
                  >
                    <option value="Suprimentos">Suprimentos</option>
                    <option value="Serviços Públicos">Serviços Públicos (Luz/Água)</option>
                    <option value="Aluguel">Aluguel</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full h-12 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold rounded-2xl flex items-center justify-center text-sm mt-6 shadow-lg shadow-red-500/10"
                >
                  Registrar Despesa
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* INCOME (LANÇAR ENTRADA) MODAL */}
        {showIncomeModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowIncomeModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={() => setShowIncomeModal(false)} />
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Registrar Entrada Manual
                </h3>
                <button 
                  onClick={() => setShowIncomeModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateIncome} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Descrição da Entrada</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Venda de produto, Gorjeta, Serviço avulso..."
                    value={incomeFormData.description}
                    onChange={e => setIncomeFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-1.5">Valor (R$)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="0,00"
                      value={incomeFormData.value}
                      onChange={e => setIncomeFormData(prev => ({ ...prev, value: e.target.value }))}
                      className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-1.5">Data</label>
                    <input 
                      type="date" 
                      required
                      value={incomeFormData.date}
                      onChange={e => setIncomeFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Categoria</label>
                  <select 
                    value={incomeFormData.category}
                    onChange={e => setIncomeFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-zinc-400"
                  >
                    <option value="Outros">Outros</option>
                    <option value="Venda de Produto">Venda de Produto</option>
                    <option value="Gorjeta">Gorjeta</option>
                    <option value="Serviço Avulso">Serviço Avulso</option>
                    <option value="Reembolso">Reembolso</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-2xl flex items-center justify-center text-sm mt-6 shadow-lg shadow-emerald-500/10"
                >
                  Registrar Entrada
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* PAUSE (MARCAR PAUSA) MODAL */}
        {showPauseModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowPauseModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={() => setShowPauseModal(false)} />
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> Pausar Agenda / Folga
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
                  <label className="block text-zinc-400 text-xs font-bold mb-1.5">Motivo da Pausa</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Almoço prolongado, Manutenção interna..."
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
                  Programar Bloqueio
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* CUSTOMER MODAL */}
        {showCustomerModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm"
          >
            <div className="absolute inset-0" onClick={() => setShowCustomerModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 light:bg-white border-t border-white/10 light:border-black/5 ios-sheet p-6 relative z-10 animate-fade-in-up"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={() => setShowCustomerModal(false)} />
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-[var(--foreground)] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#fd9602]" /> Cadastrar Cliente
                </h3>
                <button 
                  onClick={() => setShowCustomerModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 light:hover:text-zinc-700 p-1.5 rounded-full bg-zinc-950 light:bg-zinc-100 border border-white/5 light:border-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 light:text-zinc-500 text-xs font-bold mb-1.5">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nome do cliente"
                    value={customerFormData.nome}
                    onChange={e => setCustomerFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full bg-zinc-950 light:bg-white border border-white/5 light:border-zinc-200 text-zinc-200 light:text-zinc-950 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 light:text-zinc-500 text-xs font-bold mb-1.5">E-mail (Opcional)</label>
                  <input 
                    type="email" 
                    placeholder="cliente@email.com"
                    value={customerFormData.email}
                    onChange={e => setCustomerFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-zinc-950 light:bg-white border border-white/5 light:border-zinc-200 text-zinc-200 light:text-zinc-950 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#fd9602]"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm mt-6 shadow-lg shadow-[#fd9602]/10"
                >
                  Salvar Cadastro
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* SERVICES MANAGEMENT SLIDE MODAL (iOS STYLE AS SPECIFIED FOR SOMENTE 5 ICONES) */}
        {showServiceListModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowServiceListModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10 h-[85vh] flex flex-col"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5 shrink-0" onClick={() => setShowServiceListModal(false)} />
              
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#fd9602]" /> Tabela de Serviços
                </h3>
                <button 
                  onClick={() => {
                    setServiceFormData({ id: '', nome: '', preco: '' })
                    setShowServiceModal(true)
                  }}
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-950" /> Novo
                </button>
              </div>

              {/* Search box inside modal */}
              <div className="relative mb-4 shrink-0">
                <input 
                  type="text"
                  placeholder="Pesquisar serviço..."
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#fd9602]"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
              </div>

              {/* Services List Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {filteredServices.length === 0 ? (
                  <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-2xl text-center text-zinc-500 text-xs">
                    Nenhum serviço cadastrado
                  </div>
                ) : (
                  filteredServices.map(s => (
                    <div 
                      key={s.id}
                      className="bg-zinc-950 border border-white/5 p-4 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                          <Tag className="w-4 h-4 text-[#fd9602]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-200">{s.nome}</h4>
                          <span className="text-[11px] font-extrabold text-[#fd9602]">R$ {s.preco.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            setServiceFormData({ id: s.id, nome: s.nome, preco: s.preco.toString() })
                            setShowServiceModal(true)
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 text-[10px] font-bold"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteService(s.id)}
                          className="p-1.5 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-650 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* DETAILED SERVICE ADD/EDIT POPUP */}
        {showServiceModal && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowServiceModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 border-t border-white/10 ios-sheet p-6 relative z-10"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={() => setShowServiceModal(false)} />
              
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
                  className="w-full btn-primary h-12 flex items-center justify-center font-bold text-sm mt-6 shadow-lg shadow-[#fd9602]/10"
                >
                  Salvar Serviço
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* NATIVE DEVICE IMAGE ADJUSTMENT MODAL (ZOOM & ROTATION WITH PREVIEW) */}
        {imageToAdjust && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#fd9602]" /> Ajustar Imagem
                </h3>
                <button 
                  onClick={() => setImageToAdjust(null)}
                  className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewport Frame preview (Circle for profile, Rectangle for Banner) */}
              <div className="flex flex-col items-center justify-center bg-zinc-950/60 border border-white/5 p-4 rounded-3xl">
                <div 
                  className={`overflow-hidden border-2 border-dashed border-white/20 bg-zinc-950 flex items-center justify-center relative ${
                    adjustType === 'avatar' 
                      ? 'w-[200px] h-[200px] rounded-full' 
                      : 'w-[280px] h-[140px] rounded-2xl'
                  }`}
                >
                  <img 
                    src={imageToAdjust} 
                    alt="Adjustment Preview" 
                    style={{ 
                      transform: `scale(${zoom}) rotate(${rotation}deg)`, 
                      transition: 'transform 0.05s ease-out' 
                    }}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-3">
                  Visualização da foto {adjustType === 'avatar' ? 'de Perfil' : 'do Estabelecimento'}
                </p>
              </div>

              {/* Slider Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-400 font-bold">Zoom (Escala): {zoom.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.05"
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#fd9602]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-400 font-bold">Girar (Rotação): {rotation}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    step="1"
                    value={rotation}
                    onChange={e => setRotation(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setImageToAdjust(null)}
                  className="bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-zinc-400 font-bold py-3.5 rounded-2xl text-xs active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveAdjustedImage}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-3.5 rounded-2xl text-xs active:scale-95 transition-transform shadow-lg shadow-emerald-500/10"
                >
                  Confirmar e Aplicar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* GOAL (AJUSTAR META) MODAL */}
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowGoalModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full max-w-md bg-zinc-900 light:bg-white border-t border-white/10 light:border-black/5 ios-sheet p-6 relative z-10"
            >
              {/* Drag Indicator */}
              <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto mb-5" onClick={() => setShowGoalModal(false)} />
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-[var(--foreground)] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#fd9602]" /> Ajustar Meta Mensal
                </h3>
                <button 
                  onClick={() => setShowGoalModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full bg-zinc-950 light:bg-zinc-100 border border-white/5 light:border-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Defina um objetivo financeiro de faturamento ou saldo do mês para seu negócio. Isso ajuda a acompanhar a barra de progresso no painel inicial.
                </p>

                <div>
                  <label className="block text-zinc-400 light:text-zinc-500 text-xs font-bold mb-1.5 uppercase tracking-wider">Valor Alvo (R$)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Ex: 5000"
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    className="w-full bg-zinc-950 light:bg-white border border-white/5 light:border-zinc-200 rounded-2xl px-4 py-3 text-sm text-zinc-200 light:text-zinc-950 focus:outline-none focus:border-[#fd9602]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowGoalModal(false)}
                    className="bg-zinc-950 light:bg-zinc-100 border border-white/5 light:border-zinc-200 text-zinc-400 light:text-zinc-600 font-bold py-3.5 rounded-2xl text-xs active:scale-95 transition-transform"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSaveGoal}
                    className="bg-[#fd9602] hover:bg-[#e08502] text-zinc-950 font-black py-3.5 rounded-2xl text-xs active:scale-95 transition-transform shadow-lg shadow-[#fd9602]/10"
                  >
                    Salvar Meta
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  )
}
