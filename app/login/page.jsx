import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-800 rounded-lg mx-auto flex items-center justify-center text-white font-bold text-xl mb-2">
            M
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Login Admin</CardTitle>
          <CardDescription>
            Sistem Informasi Keuangan Masjid Al-Ikhlas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="Masukkan username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full bg-emerald-800 hover:bg-emerald-900 mt-6">
            Masuk ke Sistem
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}