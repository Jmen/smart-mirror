import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.TFL_API_KEY) {
    return NextResponse.json(
      { error: 'TfL API not configured' }, 
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      'https://api.tfl.gov.uk/Line/Mode/tube/Status',
      {
        headers: {
          'app_key': process.env.TFL_API_KEY
        }
      }
    );

    if (response.status === 429) {
      return NextResponse.json(
        { error: 'TfL API not configured correctly' }, 
        { status: 503 }
      );
    }

    if (!response.ok) {
      console.error('TfL API Error:', {
        status: response.status,
        statusText: response.statusText
      });
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`TfL API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('TfL API Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch tube status',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
} 