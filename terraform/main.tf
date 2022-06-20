terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 4.19"
    }
  }

  required_version = ">= 1.2.3"
}

provider "aws" {
  profile = "default"
  region = "us-east-1"

  default_tags {
    tags = {
      team = "Team 7"
    }
  }
}

resource "aws_vpc" "team_7_web" {
  cidr_block = "12.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    "Name" = "Team 7 web"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.team_7_web.id

  tags = {
    "Name" = "Internet gateway"
  }
}

resource "aws_subnet" "public_1" {
  vpc_id = aws_vpc.team_7_web.id
  cidr_block = "12.0.0.0/24"
  map_public_ip_on_launch = true
  availability_zone = "us-east-1a"

  tags = {
    "Name" = "Public subnet 1"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id = aws_vpc.team_7_web.id
  cidr_block = "12.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone = "us-east-1b"

  tags = {
    "Name" = "Public subnet 2"
  }
}

resource "aws_eip" "nat_ip" {
  vpc = true  
}

resource "aws_nat_gateway" "nat_gateway" {
  vpc_id = aws_vpc.team_7_web.id
  subnet_id = aws_subnet.public_1.id
  allocation_id = aws_eip.nat_ip.id
  connectivity_type = "public"
  
  tags = {
    "Name" = "Nat gateway"
  }
}

resource "aws_route_table" "routing_table_public" {
  vpc_id = aws_vpc.team_7_web.id

  route = {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
    
  }
}

resource "aws_route_table" "routing_table_private" {
  vpc_id = aws_vpc.team_7_web.id

  route = {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.nat_gateway.id
  }
}

resource "aws_subnet" "private" {
  vpc_id = aws_vpc.team_7_web.id
  cidr_block = "12.0.1.0/24"
  map_public_ip_on_launch = false

  tags = {
    "Name" = "Subnet private"
  }
}

resource "aws_route_table_association" "rtba_public_1" {
  subnet_id = aws_subnet.public_1.id
  route_table_id = aws_route_table.routing_table_public.id
}

resource "aws_route_table_association" "rtba_public_2" {
  subnesubnet_id = aws_subnet.public_2.id
  route_table_id = aws_route_table.routing_table_public.id  
}

resource "aws_route_table_association" "rtba_private" {
  subnesubnet_id = aws_subnet.private.id
  rouroute_table_id = aws_route_table.routing_table_private.id  
}

resource "aws_security_group" "load_balancer_sg" {
    vpc_id = aws_vpc.team_7_web.id
    ingress {
      cidr_blocks = [ "0.0.0.0/0" ]
      description = "HTTP from everywhere"
      from_port = 80
      to_port = 80
      protocol = "tcp"
    }
    egress {
      cidr_blocks = [ "0.0.0.0/0" ]
      description = "all to everywhere"
      from_port = 0
      to_port = 0
      protocol = "-1"
    }
}

