# Student API Kubernetes Tasks

## Apply commands

```bash
kubectl apply -f student-deployment.yaml
kubectl get pods
kubectl get deployments

kubectl apply -f student-service.yaml
kubectl get services

kubectl autoscale deployment student-api-deployment --cpu=50% --min=2 --max=5
kubectl get hpa
kubectl get pods

kubectl apply -f load-generator.yaml
kubectl get hpa -w
kubectl get pods -w
kubectl top pods
kubectl delete -f load-generator.yaml

kubectl set image deployment/student-api-deployment student-api=student-api:v2
kubectl rollout status deployment student-api-deployment
kubectl get pods
kubectl rollout undo deployment student-api-deployment
```

## Answers

- 2 pod ажиллаж байгаа нь Deployment-ийн `replicas: 2` тохиргооноос болсон.
- Pod устгавал Deployment/ReplicaSet шинэ pod автоматаар дахин үүсгэнэ.
- Service нь тогтвортой endpoint болон load balancing өгдөг.
- Pod IP-г шууд ашиглаж болохгүй, учир нь pod дахин үүсэхэд IP өөрчлөгдөж болно.
- CPU өсөхөд HPA replica тоог ихэсгэнэ.
- Load буурахад HPA pod-уудыг аажмаар буцаан цөөлнө.
- Rolling update нь шинэ pod-уудыг ээлжлэн босгож, хуучныг ээлжлэн буулгадаг тул downtime багатай.
- Rollback нь алдаатай release-ийг өмнөх ажиллаж байсан хувилбар руу хурдан буцаахад хэрэгтэй.
- Selector ба label match болохгүй бол Service ямар ч endpoint олохгүй.
- Pod-ийг дахин үүсгэж байгаа компонент нь Deployment-ийн удирдаж буй ReplicaSet.
- System бүрэн унадаггүй, учир нь үлдсэн pod-ууд Service-ээр request авч үргэлжлүүлэн ажиллана.
- CPU 100% хүрээд удааширч байвал ихэнхдээ зөв шийдэл нь horizontal scaling, Service load balancing, HPA.
- Vertical scaling нь нэг pod-д CPU/RAM нэмэх, horizontal scaling нь pod тоог өсгөх.
- Sidecar pattern нь нэг pod дотор үндсэн container-тай хамт туслах container ажиллуулах загвар.
- Node failure үед failed node дээр байсан pod-ууд алга болж, scheduler өөр node дээр шинэ pod ажиллуулахыг оролдоно.

## Notes

- `kubectl top` болон CPU-based HPA ажиллахын тулд cluster дээр Metrics Server байх шаардлагатай.
- CPU-based HPA зөв ажиллахын тулд container дээр `resources.requests.cpu` бас тохируулсан байх нь зөв.
- Docker Desktop Kubernetes орчинд local image ашиглахын тулд `imagePullPolicy: IfNotPresent` тавьсан.
- Docker Desktop дээр Metrics Server-д `--kubelet-insecure-tls` нэмэхгүй бол kubelet certificate verify дээр унах тохиолдол гарч болно.
- `load-generator.yaml` ашиглаад cluster дотроос service рүү тасралтгүй request өгч HPA test хийж болно.
