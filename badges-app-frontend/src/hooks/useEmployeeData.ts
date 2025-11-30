import { useState, useEffect, useMemo } from 'react';
import { fetchEmployees } from '../api/ApiEmployee';
import { fetchCompanies } from '../api/apiCompany';
import type { UserDTO, CompanyDTO, Status } from '../types';
import { toast } from 'react-toastify';

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error && typeof err.message === 'string') return err.message;
    // Add more specific error handling if needed
    return 'Une erreur est survenue';
};

const ITEMS_PER_PAGE = 10;

export const useEmployeeData = () => {
    const [employees, setEmployees] = useState<UserDTO[]>([]);
    const [companies, setCompanies] = useState<CompanyDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter and sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
    const [companyFilter, setCompanyFilter] = useState<number | 'ALL'>('ALL');
    const [sortKey, setSortKey] = useState<keyof UserDTO>('firstName');
    const [sortAsc, setSortAsc] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    const loadData = async () => {
        setLoading(true);
        try {
            const [emps, comps] = await Promise.all([fetchEmployees(), fetchCompanies()]);
            setEmployees(emps);
            setCompanies(comps);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getCompanyName = useMemo(() => {
        const companyMap = new Map(companies.map(c => [c.id, c.name]));
        return (id: number) => companyMap.get(id) || '—';
    }, [companies]);

    const sortedEmployees = useMemo(() => {
        return [...employees].sort((a, b) => {
            const aVal = (sortKey === 'companyId' ? getCompanyName(a.companyId) : a[sortKey] ?? '').toString().toLowerCase();
            const bVal = (sortKey === 'companyId' ? getCompanyName(b.companyId) : b[sortKey] ?? '').toString().toLowerCase();
            return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    }, [employees, sortKey, sortAsc, getCompanyName]);

    const filteredEmployees = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return sortedEmployees.filter(emp => {
            const matchesSearch = q === '' || 
                `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
                emp.matricule?.toLowerCase().includes(q) ||
                emp.email.toLowerCase().includes(q) ||
                getCompanyName(emp.companyId).toLowerCase().includes(q);
            
            const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
            const matchesCompany = companyFilter === 'ALL' || emp.companyId === companyFilter;

            return matchesSearch && matchesStatus && matchesCompany;
        });
    }, [sortedEmployees, searchQuery, statusFilter, companyFilter, getCompanyName]);

    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE) || 1;

    const paginatedEmployees = useMemo(() => {
        return filteredEmployees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [filteredEmployees, currentPage]);

    const handleSort = (key: keyof UserDTO) => {
        if (key === sortKey) {
            setSortAsc(v => !v);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    // Generic handler to reset pagination when filters change
    const createFilterSetter = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (value: T) => {
        setter(value);
        setCurrentPage(1);
    };

    return {
        // Data
        employees: paginatedEmployees,
        allEmployees: employees, // For router-state logic
        companies,
        loading,
        reloadData: loadData,
        getCompanyName,
        
        // Filters
        searchQuery,
        setSearchQuery: createFilterSetter(setSearchQuery),
        statusFilter,
        setStatusFilter: createFilterSetter(setStatusFilter),
        companyFilter,
        setCompanyFilter: createFilterSetter(setCompanyFilter),

        // Sorting
        sortKey,
        sortAsc,
        handleSort,

        // Pagination
        currentPage,
        setCurrentPage,
        totalPages,
        totalFilteredCount: filteredEmployees.length
    };
};
