// Airtel SIM Products API
// File: app/api/airtel-sim-products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.airtSIMProduct.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Get SIM products error:', error);
    return NextResponse.json(
      { error: 'Failed to load products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, dataPackage, validity, image } = await req.json();

    if (!name || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await prisma.airtSIMProduct.create({
      data: {
        name,
        description,
        price,
        dataPackage,
        validity,
        image
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Create SIM product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const product = await prisma.airtSIMProduct.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update SIM product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    await prisma.airtSIMProduct.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete SIM product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
