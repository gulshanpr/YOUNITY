'use client'
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Dashboard = () => {

  useEffect(() => {
    const fetchAnnouncements = async() => {
      const response = await fetch('/api/getAnnouncement');
      if(response.ok) {
        const data = await response.json();
        console.log(data);
      }
      
    }

    fetchAnnouncements();
  }, []);

  return (
    <div>
      <div>
        <Card>
          <CardHeader>
            {/* <CardTitle>Card Title</CardTitle> */}
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          {/* <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter> */}
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
