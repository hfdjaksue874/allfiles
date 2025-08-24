import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Pincode = () => {
    const [pincode, setPincode] = useState('');
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPincode, setSelectedPincode] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

    // Fetch all pincodes on component mount
    const fetchPincodes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                toast.error('You must be logged in to view pincodes.');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:5000/pin`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('All pincodes:', response.data);
            
            // Ensure we're setting an array to the state
            if (Array.isArray(response.data)) {
                setPincodes(response.data);
            } else if (response.data && typeof response.data === 'object') {
                // If it's an object with pincodes property
                if (Array.isArray(response.data.pincodes)) {
                    setPincodes(response.data.pincodes);
                } else {
                    // If it's just an object with pincode data
                    const pincodeArray = Object.values(response.data);
                    setPincodes(Array.isArray(pincodeArray) ? pincodeArray : []);
                }
            } else {
                // Fallback to empty array
                setPincodes([]);
                console.error('Unexpected API response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching pincodes:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
                localStorage.removeItem('token');
            } else {
                toast.error('Failed to fetch pincodes');
            }
            setPincodes([]); // Ensure we set an empty array on error
        } finally {
            setLoading(false);
        }
    };

    const createPincode = async (e) => {
        e.preventDefault();
        
        if (!pincode || pincode.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('You must be logged in to add pincodes.');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`http://localhost:5000/pin/add`, 
                { pincode }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Create response:', response.data);
            
            if (response.status === 200 || response.status === 201) {
                toast.success('Pincode added successfully');
                setPincode(''); // Clear input
                fetchPincodes(); // Refresh list
            }
        } catch (error) {
            console.error('Error creating pincode:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
                localStorage.removeItem('token');
            } else if (error.response?.status === 409) {
                toast.error('Pincode already exists');
            } else {
                toast.error('Failed to add pincode');
            }
        } finally {
            setLoading(false);
        }
    };

    const deletePincode = async (pincodeToDelete) => {
        if (!pincodeToDelete) {
            toast.error('Please select a pincode to delete');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('You must be logged in to delete pincodes.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete pincode ${pincodeToDelete}?`)) {
            return;
        }

        try {
            setLoading(true);
            const response = await axios.delete(`http://localhost:5000/pin/delete/`, {
                data: { pincode: pincodeToDelete },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('Delete response:', response.data);
            
            if (response.status === 200) {
                toast.success('Pincode deleted successfully');
                if (pincode === pincodeToDelete) {
                    setPincode(''); // Clear input if it was the deleted pincode
                }
                setSelectedPincode(null);
                fetchPincodes(); // Refresh list
            }
        } catch (error) {
            console.error('Error deleting pincode:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
                localStorage.removeItem('token');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to delete pincodes.');
            } else if (error.response?.status === 404) {
                toast.error('Pincode not found.');
            } else {
                toast.error('Failed to delete pincode');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePincodeSelect = (selectedPin) => {
        setPincode(selectedPin);
        setSelectedPincode(selectedPin);
    };

    // Toggle sort order
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    // Filter and sort pincodes - with safety checks
    const filteredAndSortedPincodes = React.useMemo(() => {
        // Ensure pincodes is an array
        const pincodeArray = Array.isArray(pincodes) ? pincodes : [];
        let result = [...pincodeArray];
        
        // Filter by search term
        if (searchTerm) {
            result = result.filter(item => {
                if (!item) return false;
                
                const pincodeMatch = item.pincode && item.pincode.toString().includes(searchTerm);
                const nameMatch = item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase());
                const districtMatch = item.district && item.district.toLowerCase().includes(searchTerm.toLowerCase());
                const stateMatch = item.state && item.state.toLowerCase().includes(searchTerm.toLowerCase());
                
                return pincodeMatch || nameMatch || districtMatch || stateMatch;
            });
        }
        
        // Sort by pincode with safety checks
        result.sort((a, b) => {
            const pincodeA = a && a.pincode ? a.pincode.toString() : '';
            const pincodeB = b && b.pincode ? b.pincode.toString() : '';
            
            if (sortOrder === 'asc') {
                return pincodeA.localeCompare(pincodeB);
            } else {
                return pincodeB.localeCompare(pincodeA);
            }
        });
        
        return result;
    }, [pincodes, searchTerm, sortOrder]);

    useEffect(() => {
        fetchPincodes();
    }, []);

    // Debug function to inspect API response
    const debugApiResponse = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                toast.error('You must be logged in to debug API.');
                return;
            }

            const response = await axios.get(`http://localhost:5000/pin`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('API Response Type:', typeof response.data);
            console.log('Is Array?', Array.isArray(response.data));
            console.log('Response Data:', response.data);
            
            if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                console.log('Object Keys:', Object.keys(response.data));
            }
            
            toast.info('Check console for API response details');
        } catch (error) {
            console.error('Debug API error:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
                localStorage.removeItem('token');
            } else {
                toast.error('Failed to fetch API data for debugging');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-6">Pincode Management</h2>
            
            {/* Pincode Form */}
            <form onSubmit={createPincode} className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow">
                        <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit pincode"
                            className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            maxLength={6}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading || !pincode || pincode.length !== 6}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : 'Add Pincode'}
                        </button>
                        
                        {/* Debug button - can be removed in production */}
                        <button
                            type="button"
                            onClick={debugApiResponse}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Debug API
                        </button>
                    </div>
                </div>
            </form>
            
            {/* Pincodes List */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h3 className="text-xl font-semibold">Available Pincodes</h3>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-0 w-full md:w-auto">
                        {/* Search input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search pincodes..."
                                className="w-full sm:w-64 border border-gray-300 p-2 pl-8 rounded"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-2 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        
                        {/* Sort button */}
                        <button
                            type="button"
                            onClick={toggleSortOrder}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                        >
                            <span>Sort</span>
                            {sortOrder === 'asc' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                </svg>
                            )}
                        </button>
                        
                        {/* Refresh button */}
                        <button
                            type="button"
                            onClick={fetchPincodes}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-4 mb-4">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <span className="text-sm text-blue-600">Total Pincodes:</span>
                        <span className="ml-2 font-bold">{pincodes.length}</span>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <span className="text-sm text-green-600">Filtered:</span>
                        <span className="ml-2 font-bold">{filteredAndSortedPincodes.length}</span>
                    </div>
                </div>
                
                {loading && pincodes.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-600">Loading pincodes...</p>
                    </div>
                ) : filteredAndSortedPincodes.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filteredAndSortedPincodes.map((item, index) => (
                                <div 
                                    key={index} 
                                    className={`border p-3 rounded cursor-pointer transition-colors ${
                                        selectedPincode === item.pincode 
                                            ? 'bg-blue-100 border-blue-500' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => handlePincodeSelect(item.pincode)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{item.pincode}</span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deletePincode(item.pincode);
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete pincode"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {item.name && <p className="text-sm text-gray-600 truncate">{item.name}</p>}
                                    {item.district && <p className="text-xs text-gray-500 truncate">{item.district}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-gray-600">No pincodes found. Add some using the form above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pincode;