import { jsx as _jsx } from "react/jsx-runtime";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { Iconify } from '../../components/iconify';
export function PostSearch({ posts, sx }) {
    return (_jsx(Autocomplete, { sx: { width: 280 }, autoHighlight: true, popupIcon: null, slotProps: {
            paper: {
                sx: {
                    width: 320,
                    [`& .${autocompleteClasses.option}`]: {
                        typography: 'body2',
                    },
                    ...sx,
                },
            },
        }, options: posts, getOptionLabel: (post) => post.title, isOptionEqualToValue: (option, value) => option.id === value.id, renderInput: (params) => (_jsx(TextField, { ...params, placeholder: "Search post...", slotProps: {
                input: {
                    ...params.InputProps,
                    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Iconify, { icon: "eva:search-fill", sx: { ml: 1, width: 20, height: 20, color: 'text.disabled' } }) })),
                },
            } })) }));
}
