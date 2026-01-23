
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, pin } = body;

    if (!firstName || !lastName || !phone || !pin) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if agent exists
    const existing = await prisma.agent.findUnique({ where: { phone } });
    if (existing) {
        return NextResponse.json({ error: 'Agent with this phone number already exists' }, { status: 400 });
    }

    // Create Virtual Account on Flutterwave
    const tx_ref = `AGENT-REG-${uuidv4()}`;
    const email = `agent.${phone}@www.saukimart.online`; // Generate synthetic email for agent
    
    // Using environment BVN as requested
    const bvn = process.env.MY_BVN; 

    if (!process.env.FLUTTERWAVE_SECRET_KEY || !bvn) {
        return NextResponse.json({ error: 'Server misconfiguration: Missing Keys' }, { status: 500 });
    }

    let flwAccount = { account_number: '', bank_name: '', account_name: '' };

    try {
        const flwRes = await axios.post(
            'https://api.flutterwave.com/v3/virtual-account-numbers',
            {
                email,
                is_permanent: true,
                bvn, 
                tx_ref,
                phonenumber: phone,
                firstname: firstName,
                lastname: `${lastName} Sauki Mart FLW`, // Appending branding as requested
                narration: `Sauki Agent ${firstName}`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (flwRes.data.status === 'success') {
            flwAccount = {
                account_number: flwRes.data.data.account_number,
                bank_name: flwRes.data.data.bank_name,
                account_name: `${firstName} ${lastName} Sauki Mart FLW` // Fallback/Expected name
            };
        } else {
            throw new Error(flwRes.data.message);
        }
    } catch (flwError: any) {
        console.error('FLW Account Creation Failed:', flwError.response?.data || flwError.message);
        return NextResponse.json({ error: 'Failed to provision banking wallet. Please try again later.' }, { status: 502 });
    }

    const agent = await prisma.agent.create({
        data: {
            firstName,
            lastName,
            phone,
            pin, // Storing as plain text per specific instruction "just require his 4 digit pin ... check if correctly"
            flwAccountNumber: flwAccount.account_number,
            flwBankName: flwAccount.bank_name,
            flwAccountName: flwAccount.account_name,
            balance: 0
        }
    });

    return NextResponse.json({ success: true, agent });

  } catch (error: any) {
    console.error('Agent Reg Error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
