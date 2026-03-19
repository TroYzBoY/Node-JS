# Student API Kubernetes Architecture

```mermaid
flowchart LR
    U[User or curl] --> S[Service<br/>student-api-service]
    S --> P1[Pod 1<br/>student-api]
    S --> P2[Pod 2<br/>student-api]
    P1 --> D[Deployment<br/>student-api-deployment]
    P2 --> D
    H[HPA] --> D
    D --> C[Cluster]
    C --> M[Control Plane]
    C --> W[Worker Node]
```

Control Plane нь desired state-ийг хадгалж, Worker Node дээр pod-ууд ажиллана. HPA нь CPU ачааллаас хамаарч Deployment-ийн replica тоог 2-оос 5 хүртэл өсгөж эсвэл бууруулна.
