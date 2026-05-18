import type { ApiResponse, AuthResponse, UserDto } from './types'

export const mockLoginResponse: ApiResponse<AuthResponse> = {
  status: 'success',
  message: 'Call API success.',
  data: {
    accessToken: 'mock-access-token-se330-nguyen-minh-an',
    tokenType: 'Bearer',
    expiresIn: 86400,
    uid: 'SV22520001',
    email: '22520001@gm.uit.edu.vn',
    name: 'Nguyễn Minh An',
    role: 'USER',
  },
  errorCode: null,
  timestamp: '2026-05-17T10:00:00',
}

export const mockMeResponse: ApiResponse<UserDto> = {
  status: 'success',
  message: 'Call API success.',
  data: {
    id: 1,
    uid: 'SV22520001',
    email: '22520001@gm.uit.edu.vn',
    name: 'Nguyễn Minh An',
    role: 'USER',
  },
  errorCode: null,
  timestamp: '2026-05-17T10:00:00',
}
