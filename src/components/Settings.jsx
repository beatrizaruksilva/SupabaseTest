import React, { useState } from 'react'
import { UserAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Settings = () => {
    const { updateUserPassword, deleteUserAccount } = UserAuth()
    const [newPassword, setNewPassword] = useState('')
    const navigate = useNavigate()

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

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Configurações da Conta</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        &larr; Voltar para o Dashboard
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h4>
                    <div className="flex gap-4 flex-col sm:flex-row">
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
    )
}

export default Settings
