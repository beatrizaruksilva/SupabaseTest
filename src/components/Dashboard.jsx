import React, { useState, useEffect, useRef } from 'react'
import { UserAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'

const Dashboard = () => {
    const { session, signOut, updateUserPassword, deleteUserAccount } = UserAuth()
    const [userId, setUserId] = useState('')
    const [medias, setMedias] = useState([])
    const [uploadStatus, setUploadStatus] = useState(null)
    const [newPassword, setNewPassword] = useState('')
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const getUser = async () => {
        try {
            const { data: user } = await supabase.auth.getUser()
            return user
        } catch (error) {
            console.log(error)
        }
    }

    const handlePasswordUpdate = async () => {
        if (!newPassword) return;
        const result = await updateUserPassword(newPassword);
        if (result.success) {
            alert("Senha atualizada com sucesso!");
            setNewPassword("");
        } else {
            alert("Erro ao atualizar senha: " + result.error.message);
        }
    }

    const handleDeleteAccount = async () => {
        if (window.confirm("CONFIRMAÇÃO: Tem certeza que deseja excluir sua conta permanentemente?")) {
            const result = await deleteUserAccount();
            if (result.success) {
                alert("Conta excluída.");
                navigate("/");
            } else {
                alert("Erro ao excluir conta: " + result.error.message);
            }
        }
    }

    const uploadFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploadStatus({ type: 'uploading', message: 'Enviando arquivo...' })

        try {
            const { data, error } = await supabase.storage
                .from('medias')
                .upload(userId + "/" + uuidv4(), file)

            if (data) {
                getMedias();
                setUploadStatus({ type: 'success', message: 'Arquivo enviado com sucesso!' })
                setTimeout(() => setUploadStatus(null), 3000)
            }
            if (error) {
                console.log(error)
                setUploadStatus({ type: 'error', message: 'Erro ao enviar arquivo.' })
                setTimeout(() => setUploadStatus(null), 3000)
            }
        } catch (error) {
            console.log(error)
            setUploadStatus({ type: 'error', message: 'Erro inesperado.' })
            setTimeout(() => setUploadStatus(null), 3000)
        }
    }

    const getMedias = async () => {
        try {
            const { data: medias } = await supabase.storage
                .from('medias')
                .list(userId + '/');

            if (medias) {
                setMedias(medias)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSignOut = async (e) => {
        e.preventDefault()
        try {
            await signOut()
            navigate('/signin')
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                // getMedias() // Call this if you want to load medias on start
            }
        }
        fetchUser()
    }, [])

    // Trigger media load when userId is set
    useEffect(() => {
        if (userId) getMedias()
    }, [userId])


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-blue-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <h1 className="text-white text-xl font-bold tracking-wider">Arquivos</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-blue-100 text-sm hidden sm:block">
                                {session?.user?.email}
                            </span>
                            <button
                                onClick={handleSignOut}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out border border-transparent hover:border-blue-500 shadow-sm"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-blue-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Bem-vindo(a)
                    </h2>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Você pode armazenar imagens ou vídeos aqui.
                    </p>
                </div>

                {/* Upload Zone */}
                <div className="max-w-3xl mx-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={uploadFile}
                        className="hidden"
                        accept="image/*,video/*"
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-white hover:bg-blue-50 transition duration-300 ease-in-out cursor-pointer group"
                    >
                        <div className="space-y-2 text-center">
                            <svg
                                className="mx-auto h-20 w-20 text-gray-400 group-hover:text-blue-500 transition duration-300"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600 hover:text-blue-500">Faça upload de um arquivo</span>
                                <span className="pl-1">ou arraste e solte</span>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF, MP4 até 10MB</p>
                        </div>
                    </div>

                    {/* Notification Area */}
                    {uploadStatus && (
                        <div className={`mt-4 p-4 rounded-md text-center ${uploadStatus.type === 'success' ? 'bg-green-100 text-green-700' :
                            uploadStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {uploadStatus.message}
                        </div>
                    )}
                </div>

                {/* Media Gallery */}
                <div className="max-w-7xl mx-auto mt-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 px-4">Meus Arquivos</h3>

                    {medias.length === 0 ? (
                        <p className="text-center text-gray-500">Nenhum arquivo encontrado.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                            {medias.map((media) => {
                                const { data: { publicUrl } } = supabase.storage
                                    .from('medias')
                                    .getPublicUrl(userId + '/' + media.name);

                                const isVideo = media.name.match(/\.(mp4|webm|ogg)$/i);

                                return (
                                    <div key={media.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                            {isVideo ? (
                                                <video
                                                    src={publicUrl}
                                                    controls
                                                    className="w-full h-48 object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={publicUrl}
                                                    alt={media.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <p className="text-sm text-gray-600 truncate" title={media.name}>
                                                {media.name}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Account Settings */}
                <div className="max-w-3xl mx-auto mt-16 px-4 pb-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Configurações da Conta</h3>

                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h4>
                        <div className="flex gap-4">
                            <input
                                type="password"
                                placeholder="Nova senha"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                            <button
                                onClick={handlePasswordUpdate}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-150"
                            >
                                Atualizar
                            </button>
                        </div>
                    </div>

                    <div className="bg-red-50 shadow rounded-lg p-6 border border-red-200">
                        <h4 className="text-lg font-medium text-red-800 mb-2">Zona de Perigo</h4>
                        <p className="text-red-600 mb-4 text-sm">Esta ação não pode ser desfeita. Todos os seus dados serão perdidos permanentemente.</p>
                        <button
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-150 w-full sm:w-auto"
                        >
                            Excluir Minha Conta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
