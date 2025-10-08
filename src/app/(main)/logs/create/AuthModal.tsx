'use client';

import { useRef, useEffect } from 'react';
import SignaturePad from 'react-signature-canvas';
import type { SignatureCanvas } from 'react-signature-canvas';
import { AuthData } from '../types';

interface AuthModalProps {
  authModal: { type: string; index: number; onSuccess: (authData: { authId: string; authName: string; password: string }) => void } | null;
  authData: AuthData;
  setAuthData: React.Dispatch<React.SetStateAction<AuthData>>;
  setAuthModal: React.Dispatch<React.SetStateAction<{ type: string; index: number; onSuccess: (authData: { authId: string; authName: string; password: string }) => void } | null>>;
  setCheckedItems: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

export default function AuthModal({
  authModal,
  authData,
  setAuthData,
  setAuthModal,
  setCheckedItems,
}: AuthModalProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  // Log authModal and authData for debugging
  useEffect(() => {
    console.log('AuthModal opened with props:', authModal);
    console.log('Current authData:', authData);
  }, [authModal, authData]);

  // Clear signature canvas when modal opens
  useEffect(() => {
    if (authModal) {
      sigCanvas.current?.clear();
      setAuthData({ authId: '', authName: '', password: '', sign: '', date: '', expDate: '' });
    }
  }, [authModal, setAuthData]);

  // Early return if authModal is null
  if (!authModal) return null;

  const handleAuthorize = () => {
    console.log('handleAuthorize called with authData:', {
      authId: authData.authId,
      authName: authData.authName,
      password: authData.password,
      sign: authData.sign ? 'Signature present' : 'Signature missing',
      date: authData.date,
      expDate: authData.expDate,
    });

    // Bypassing validation for testing
    const authDataToSend = {
      authId: authData.authId || 'test-id',
      authName: authData.authName || 'Test Name',
      password: authData.password || 'test-password',
    };

    console.log('Calling onSuccess with:', authDataToSend);

    // Call the onSuccess callback
    if (authModal?.onSuccess) {
      authModal.onSuccess(authDataToSend);
    } else {
      console.error('authModal.onSuccess is undefined');
      alert('Error: onSuccess callback not defined');
    }

    // Reset modal and state
    setCheckedItems((prev) => ({ ...prev, [authModal.type]: false }));
    setAuthModal(null);
    setAuthData({ authId: '', authName: '', password: '', sign: '', date: '', expDate: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start pt-20 sm:pt-16 z-50 overflow-y-auto h-screen">
      <div
        className="bg-white rounded-lg p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg border-t-4 border-yellow-500"
        style={{ marginTop: '100px', marginBottom: '50px', marginLeft: '20px', marginRight: '20px' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <h2 className="text-lg font-semibold text-yellow-700">{authModal.type} Authorization Required</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This action requires proper authorization. Please provide valid credentials.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auth ID (Staff ID)</label>
            <input
              type="text"
              name="authId"
              autoComplete="off"
              value={authData.authId}
              onChange={(e) => {
                console.log('authId changed:', e.target.value);
                setAuthData({ ...authData, authId: e.target.value });
              }}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Enter Staff ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auth Name (Staff Name)</label>
            <input
              type="text"
              name="authName"
              autoComplete="off"
              value={authData.authName}
              onChange={(e) => {
                console.log('authName changed:', e.target.value);
                setAuthData({ ...authData, authName: e.target.value });
              }}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Enter Staff Name"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Password</label>
          <input
            type="password"
            name="authPass"
            autoComplete="new-password"
            value={authData.password}
            onChange={(e) => {
              console.log('password changed:', e.target.value);
              setAuthData({ ...authData, password: e.target.value });
            }}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Enter Password"
          />
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Sign
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 4l-1.41 1.41M4 20h16M4 20L19 5a2.828 2.828 0 114 4L8 20H4z" />
              </svg>
            </label>
            <button
              onClick={() => {
                sigCanvas.current?.clear();
                setAuthData({ ...authData, sign: '', date: '', expDate: '' });
              }}
              className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded shadow transition"
            >
              Clear
            </button>
          </div>
          <div className="w-full border rounded">
            <SignaturePad
              ref={sigCanvas}
              canvasProps={{ className: "w-full h-24 rounded" }}
              onEnd={() => {
                if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                  const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
                  const currentDate = new Date().toISOString();
                  const expDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                  console.log('Signature captured:', signature);
                  setAuthData((prev) => ({ ...prev, sign: signature, date: currentDate, expDate }));
                } else {
                  console.log('Signature canvas is empty');
                }
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              if (authModal?.type) {
                setCheckedItems((prev) => ({ ...prev, [authModal.type]: false }));
              }
              setAuthModal(null);
              setAuthData({ authId: '', authName: '', password: '', sign: '', date: '', expDate: '' });
            }}
            className="px-5 py-2 text-sm font-medium bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('Authorize button clicked');
              handleAuthorize();
            }}
            className="px-5 py-2 text-sm font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
          >
            Authorize
          </button>
        </div>
      </div>
    </div>
  );
}