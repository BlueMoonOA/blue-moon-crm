import NextAuth from 'next-auth';
// use a RELATIVE import to avoid path-alias issues
import { authOptions } from '../../../lib/auth';

const handler = NextAuth(authOptions);
export default handler;

