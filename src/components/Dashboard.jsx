import React, { useState, useEffect, useRef } from 'react'
import { UserAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient' // Keep for auth
import { v4 as uuidv4 } from 'uuid'
import { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../r2Client'

const Dashboard = () => {
    const { session, signOut, updateUserPassword, deleteUserAccount } = UserAuth()
    const [userId, setUserId] = useState('')
    const [medias, setMedias] = useState([])
    const [uploadStatus, setUploadStatus] = useState(null)
    const [activeMenu, setActiveMenu] = useState(null)
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






    const handleDeleteFile = async (key, id) => {
        if (!window.confirm("Tem certeza que deseja excluir este arquivo?")) return;

        try {
            const command = new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
            });

            await r2Client.send(command);

            // Optimistic update
            setMedias(prev => prev.filter(item => item.id !== id));
            setActiveMenu(null);
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Erro ao excluir arquivo.");
        }
    }

    const uploadFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploadStatus({ type: 'uploading', message: 'Enviando arquivo...' })

        try {
            const fileKey = `${userId}/${uuidv4()}-${file.name}`;

            const command = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: fileKey,
                ContentType: file.type,
            });

            // Generate Presigned URL (valid for 5 minutes)
            console.log("Generating signed URL for:", fileKey, "Type:", file.type);
            const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
            console.log("Signed URL:", signedUrl);

            // Upload using fetch
            console.log("Starting fetch upload...");
            const response = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (response.ok) {
                getMedias();
                setUploadStatus({ type: 'success', message: 'Arquivo enviado com sucesso!' })
                setTimeout(() => setUploadStatus(null), 3000)
            } else {
                console.log(response)
                setUploadStatus({ type: 'error', message: 'Erro ao enviar arquivo (R2 Presigned).' })
                setTimeout(() => setUploadStatus(null), 3000)
            }

        } catch (error) {
            console.log(error)
            setUploadStatus({ type: 'error', message: 'Erro inesperado: ' + error.message })
            setTimeout(() => setUploadStatus(null), 3000)
        }
    }

    const getMedias = async () => {
        if (!userId) return;
        try {
            const command = new ListObjectsV2Command({
                Bucket: R2_BUCKET_NAME,
                Prefix: userId + '/',
            });

            const { Contents } = await r2Client.send(command);

            if (Contents) {
                setMedias(Contents.map(item => ({
                    id: item.ETag, // Use ETag as ID
                    name: item.Key.split('/').pop(), // Extract filename
                    key: item.Key
                })))
            } else {
                setMedias([]);
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
            }
        }
        fetchUser()
    }, [])

    // Trigger media load when userId is set
    useEffect(() => {
        if (userId) getMedias()
    }, [userId])


    return (
        <div className="min-h-screen bg-gray-50" onClick={() => setActiveMenu(null)}>
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
                                onClick={() => navigate('/settings')}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out border border-transparent hover:border-blue-500 shadow-sm"
                            >
                                Configurações
                            </button>
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
                                // Construct Public URL (Assumes file is public)
                                const publicUrl = `${R2_PUBLIC_URL}/${media.key}`;
                                console.log("Media URL:", publicUrl); // Debug log

                                const isVideo = media.name.match(/\.(mp4|webm|ogg)$/i);

                                return (
                                    <div key={media.id} className="relative bg-white rounded-lg shadow-md overflow-visible hover:shadow-lg transition-shadow duration-300">
                                        {/* Menu Button */}
                                        <div className="absolute top-2 right-2 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === media.id ? null : media.id);
                                                }}
                                                className="bg-white/80 hover:bg-white p-1 rounded-full shadow-sm backdrop-blur-sm transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenu === media.id && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-20">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteFile(media.key, media.id);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            )}
                                        </div>

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
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Error+Loading+Image' }}
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

            </div>
        </div>
    )
}

export default Dashboard
